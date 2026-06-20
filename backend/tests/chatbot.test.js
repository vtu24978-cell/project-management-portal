const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');

// Mock the mailer so tests don't attempt real SMTP connections
jest.mock('../utils/mailer', () => ({
  sendTaskNotification: jest.fn().mockResolvedValue({ mock: true })
}));

let token;
let userId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create User
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'chatbotuser',
      email: 'chatbot@example.com',
      password: 'password123'
    });
  token = res.body.token;
  userId = res.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Chatbot API', () => {
  beforeEach(async () => {
    await Task.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/api/chatbot')
      .send({ message: 'help' });

    expect(res.statusCode).toBe(401);
  });

  it('should respond to help command', async () => {
    const res = await request(app)
      .post('/api/chatbot')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'help' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('response');
    expect(res.body.action).toBe('help');
    expect(res.body.refresh).toBe(false);
  });

  it('should create a task using create task command', async () => {
    const res = await request(app)
      .post('/api/chatbot')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'create task: Bot Task - This is a test task created by the chatbot.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe('create');
    expect(res.body.refresh).toBe(true);
    expect(res.body.response).toContain('Bot Task');

    // Verify it was created in the DB
    const dbTask = await Task.findOne({ where: { userId } });
    expect(dbTask).not.toBeNull();
    expect(dbTask.title).toBe('Bot Task');
    expect(dbTask.description).toBe('This is a test task created by the chatbot.');
  });

  it('should return error if chatbot description is too short', async () => {
    const res = await request(app)
      .post('/api/chatbot')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'create task: Bad Task - Too short' });

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe('error');
    expect(res.body.refresh).toBe(false);
    expect(res.body.response).toContain('failed');
  });

  it('should list tasks using list tasks command', async () => {
    // Seed task
    await Task.create({
      title: 'Existing Task',
      description: 'Existing task description for chatbot testing.',
      status: 'Pending',
      userId
    });

    const res = await request(app)
      .post('/api/chatbot')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'list tasks' });

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe('list');
    expect(res.body.response).toContain('Existing Task');
  });

  it('should respond to stats command', async () => {
    const res = await request(app)
      .post('/api/chatbot')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'stats' });

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe('stats');
    expect(res.body.response).toContain('Task Statistics');
  });
});
