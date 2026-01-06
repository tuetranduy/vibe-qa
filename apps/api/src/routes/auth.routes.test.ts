import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '@vibe-qa/database';
import { authRouter } from './auth.routes';
import { errorHandler } from '../middleware/errorHandler';
import { requestIdMiddleware } from '../middleware/requestId';
import { hashPassword } from '../utils/password';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(requestIdMiddleware);
app.use('/api/v1/auth', authRouter);
app.use(errorHandler);

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.user.name).toBe('Test User');
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.meta.requestId).toBeDefined();
    expect(response.body.meta.timestamp).toBeDefined();
  });

  it('should return 400 for duplicate email', async () => {
    await prisma.user.create({
      data: {
        email: 'duplicate@example.com',
        password: 'hashedpassword',
        name: 'Existing User',
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'Test123!@#',
        name: 'New User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('EMAIL_EXISTS');
    expect(response.body.error.message).toBe('Email already registered');
    expect(response.body.meta.requestId).toBeDefined();
  });

  it('should return 400 for invalid password format (no uppercase)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'test123!@#',
        name: 'Test User',
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toBe('Validation failed');
    expect(response.body.error.details).toBeDefined();
    expect(response.body.error.details.some((d: any) => 
      d.message.includes('uppercase')
    )).toBe(true);
  });

  it('should return 400 for invalid password format (no lowercase)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TEST123!@#',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.some((d: any) => 
      d.message.includes('lowercase')
    )).toBe(true);
  });

  it('should return 400 for invalid password format (no number)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestTest!@#',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.some((d: any) => 
      d.message.includes('number')
    )).toBe(true);
  });

  it('should return 400 for invalid password format (no special char)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestTest123',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.some((d: any) => 
      d.message.includes('special character')
    )).toBe(true);
  });

  it('should return 400 for invalid password format (too short)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Te1!',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.some((d: any) => 
      d.message.includes('at least 8 characters')
    )).toBe(true);
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Test123!@#',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.some((d: any) => 
      d.field === 'email'
    )).toBe(true);
  });

  it('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should verify password is hashed in database', async () => {
    const password = 'Test123!@#';
    
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'hash-test@example.com',
        password,
        name: 'Hash Test User',
      });

    const user = await prisma.user.findUnique({
      where: { email: 'hash-test@example.com' },
    });

    expect(user).toBeDefined();
    expect(user?.password).not.toBe(password);
    expect(user?.password.startsWith('$2')).toBe(true);
    expect(user?.password.length).toBe(60);
  });

  it('should never return password in response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    const responseStr = JSON.stringify(response.body);
    expect(responseStr).not.toContain('Test123!@#');
    expect(responseStr).not.toContain('$2a$');
    expect(responseStr).not.toContain('$2b$');
  });
});

describe('POST /api/v1/auth/login', () => {
  const testUser = {
    email: 'logintest@example.com',
    password: 'TestPass123!',
    name: 'Login Test User',
  };

  let hashedPassword: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    
    // Create test user in database
    hashedPassword = await hashPassword(testUser.password);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
      },
    });
  });

  it('should return 200 with token and user for valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.token).toBeDefined();
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.user.name).toBe(testUser.name);
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.meta.requestId).toBeDefined();
    expect(response.body.meta.timestamp).toBeDefined();
  });

  it('should return 401 for incorrect password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(response.body.error.message).toBe('Invalid credentials');
  });

  it('should return 401 for non-existent email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testUser.password,
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(response.body.error.message).toBe('Invalid credentials');
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        password: testUser.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 for missing password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'not-an-email',
        password: testUser.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return valid JWT token that can be decoded', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    const token = response.body.data.token;

    // Decode JWT
    const decoded = jwt.decode(token) as any;
    expect(decoded).toBeDefined();
    expect(decoded.email).toBe(testUser.email);
    expect(decoded.userId).toBeDefined();
    expect(typeof decoded.userId).toBe('number');
  });

  it('should never include password in response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user.password).toBeUndefined();
    
    // Check entire response body doesn't contain password
    const responseStr = JSON.stringify(response.body);
    expect(responseStr).not.toContain(testUser.password);
    expect(responseStr).not.toContain(hashedPassword);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully with valid token', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'logout-test@example.com',
        password: await hashPassword('Test123!@#'),
        name: 'Logout Test User',
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.message).toBe('Logout successful');
    expect(response.body.meta).toBeDefined();
    expect(response.body.meta.requestId).toBeDefined();
    expect(response.body.meta.timestamp).toBeDefined();
  });

  it('should return 401 without authentication token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout');

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.error.message).toBe('Missing authentication token');
    expect(response.body.meta.requestId).toBeDefined();
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.meta.requestId).toBeDefined();
  });

  it('should return 401 with expired token', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'expired-test@example.com',
        password: await hashPassword('Test123!@#'),
        name: 'Expired Test User',
      },
    });

    const expiredToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1s' }
    );

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 with malformed authorization header', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'InvalidFormat token');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.error.message).toBe('Invalid authorization format');
  });
});
