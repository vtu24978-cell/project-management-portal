const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const User = require('../models/User');

beforeAll(async () => {
  // Sync the db before running tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe(mockUser.username);
      expect(res.body.email).toBe(mockUser.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail registration if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail registration if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...mockUser, password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-register user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(mockUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(mockUser.email);
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});
