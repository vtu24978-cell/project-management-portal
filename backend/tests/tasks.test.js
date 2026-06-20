const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');

// Mock the mailer so tests don't attempt real SMTP connections
jest.mock('../utils/mailer', () => ({
  sendTaskNotification: jest.fn().mockResolvedValue({ mock: true })
}));
const { sendTaskNotification } = require('../utils/mailer');

let token1;
let token2;
let user1Id;
let user2Id;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create User 1
  const user1Res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123'
    });
  token1 = user1Res.body.token;
  user1Id = user1Res.body.id;

  // Create User 2
  const user2Res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password123'
    });
  token2 = user2Res.body.token;
  user2Id = user2Res.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Tasks API', () => {
  beforeEach(async () => {
    // Clear tasks before each test
    await Task.destroy({ where: {}, truncate: true, cascade: true });
  });

  const validTask = {
    title: 'Write unit tests',
    description: 'Write robust unit tests for the task api routing',
    status: 'Pending'
  };

  describe('POST /api/tasks (Create Task)', () => {
    it('should create a task when authorized', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send(validTask);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(validTask.title);
      expect(res.body.userId).toBe(user1Id);
    });

    it('should reject task creation if unauthorized', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send(validTask);

      expect(res.statusCode).toBe(401);
    });

    it('should validate description length (min 20 chars)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Short description',
          description: 'Too short'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should create a task with a valid due date', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send({ ...validTask, dueDate: '2026-12-31' });

      expect(res.statusCode).toBe(201);
      expect(res.body.dueDate).toBe('2026-12-31');
    });

    it('should fail task creation if due date is invalid', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send({ ...validTask, dueDate: 'invalid-date' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should save assignee name and email on task creation', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validTask,
          assigneeName: 'John Doe',
          assigneeEmail: 'john@example.com'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.assigneeName).toBe('John Doe');
      expect(res.body.assigneeEmail).toBe('john@example.com');
    });

    it('should trigger email notification when assignee email is provided', async () => {
      sendTaskNotification.mockClear();

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validTask,
          assigneeName: 'Jane Smith',
          assigneeEmail: 'jane@example.com'
        });

      // Mailer should have been invoked with correct params
      expect(sendTaskNotification).toHaveBeenCalledWith(
        'jane@example.com',
        'Jane Smith',
        validTask.title,
        validTask.description
      );
    });

    it('should NOT trigger email notification when no assignee email is given', async () => {
      sendTaskNotification.mockClear();

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send(validTask);

      expect(sendTaskNotification).not.toHaveBeenCalled();
    });

    it('should reject invalid assignee email format', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send({ ...validTask, assigneeEmail: 'not-an-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/tasks (Retrieve Tasks)', () => {
    beforeEach(async () => {
      // Seed user1 tasks
      await Task.create({
        title: 'Task A pending search',
        description: 'Detail description of task A that is pending',
        status: 'Pending',
        userId: user1Id
      });
      await Task.create({
        title: 'Task B in progress',
        description: 'Detail description of task B that is in progress',
        status: 'In Progress',
        userId: user1Id
      });
      await Task.create({
        title: 'Task C completed',
        description: 'Detail description of task C that is completed',
        status: 'Completed',
        userId: user1Id
      });

      // Seed user2 task to test isolation
      await Task.create({
        title: 'Task User 2',
        description: 'Detail description of task that belongs to user 2',
        status: 'Pending',
        userId: user2Id
      });
    });

    it('should fetch only the authenticated user\'s tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.tasks.length).toBe(3);
      expect(res.body.stats.total).toBe(3);
      expect(res.body.stats.pending).toBe(1);
      expect(res.body.stats.inProgress).toBe(1);
      expect(res.body.stats.completed).toBe(1);

      // Verify task user 2 is not present
      const user2TaskPresent = res.body.tasks.some(t => t.userId === user2Id);
      expect(user2TaskPresent).toBe(false);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=Pending')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0].status).toBe('Pending');
    });

    it('should search tasks by title/description query', async () => {
      const res = await request(app)
        .get('/api/tasks?search=search')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0].title).toContain('search');
    });

    it('should sort tasks by dueDate', async () => {
      await Task.create({
        title: 'Soonest due task',
        description: 'Detail description of task that is due soon.',
        status: 'Pending',
        dueDate: '2026-07-01',
        userId: user1Id
      });
      await Task.create({
        title: 'Latest due task',
        description: 'Detail description of task that is due late.',
        status: 'Pending',
        dueDate: '2026-08-01',
        userId: user1Id
      });

      const res = await request(app)
        .get('/api/tasks?sortBy=dueDate&order=ASC')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toBe(200);
      
      const taskIndexSoonest = res.body.tasks.findIndex(t => t.title === 'Soonest due task');
      const taskIndexLatest = res.body.tasks.findIndex(t => t.title === 'Latest due task');
      
      expect(taskIndexSoonest).toBeGreaterThanOrEqual(0);
      expect(taskIndexLatest).toBeGreaterThanOrEqual(0);
      expect(taskIndexSoonest).toBeLessThan(taskIndexLatest);
    });
  });

  describe('PUT /api/tasks/:id (Update Task)', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to update',
        description: 'A long description for the update test task',
        status: 'Pending',
        userId: user1Id
      });
      taskId = task.id;
    });

    it('should update task status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ status: 'Completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Completed');
    });

    it('should prevent updating another user\'s task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ status: 'Completed' });

      expect(res.statusCode).toBe(404);
    });

    it('should update task details including dueDate', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Updated title',
          description: 'This is a brand new description exceeding twenty characters.',
          dueDate: '2026-11-30'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated title');
      expect(res.body.description).toBe('This is a brand new description exceeding twenty characters.');
      expect(res.body.dueDate).toBe('2026-11-30');
    });
  });

  describe('DELETE /api/tasks/:id (Delete Task)', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to delete',
        description: 'A long description for the delete test task',
        status: 'Pending',
        userId: user1Id
      });
      taskId = task.id;
    });

    it('should delete task successfully', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toBe(200);

      const deletedTask = await Task.findByPk(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should prevent deleting another user\'s task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
