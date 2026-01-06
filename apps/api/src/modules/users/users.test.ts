import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '@vibe-qa/database';
import { authRouter } from '../../routes/auth.routes';
import { userRouter } from './users.routes';
import { errorHandler } from '../../middleware/errorHandler';
import { requestIdMiddleware } from '../../middleware/requestId';

const app = express();
app.use(express.json());
app.use(requestIdMiddleware);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use(errorHandler);

describe.sequential('User Profile Management', () => {
  let authToken: string;
  let userId: string;
  let testEmail: string;

  beforeEach(async () => {
    // Generate unique email for each test to avoid conflicts
    testEmail = `test-profile-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    
    // Create test user and get auth token
    const signupResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({ 
        email: testEmail, 
        password: 'Test123!@#', 
        name: 'Test User' 
      });

    expect(signupResponse.status).toBe(201);
    
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'Test123!@#' });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  afterEach(async () => {
    // Cleanup only this test's user
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {
        // Ignore if already deleted
      });
    }
  });

  describe('GET /api/v1/users/me', () => {
    it('should return user profile with valid authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('email', testEmail);
      expect(response.body.data).toHaveProperty('name', 'Test User');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('requestId');
      expect(response.body.meta).toHaveProperty('timestamp');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/users/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Missing authentication token');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token-xyz');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'InvalidFormat');
      
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Invalid authorization format');
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update name with valid request', async () => {
      const newName = 'Updated Test User';
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: newName });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', newName);
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('email', testEmail);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('meta');
    });

    it('should trim whitespace from name', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '  Trimmed Name  ' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Trimmed Name');
    });

    it('should return 400 with empty name', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should return 400 with name exceeding 100 characters', async () => {
      const longName = 'a'.repeat(101);
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: longName });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when attempting to update email', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          name: 'Valid Name',
          email: 'newemail@example.com' 
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should return 400 with unexpected fields', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          name: 'Valid Name',
          unexpected: 'field' 
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
