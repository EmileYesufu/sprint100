// Server Authentication Integration Tests
import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/config';

const prisma = new PrismaClient();

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.matchPlayer.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it.each([
      'test@gmail.com',
      'player@outlook.co.uk',
      'user@company.io',
    ])('should allow registration with email domain %s', async (email) => {
      const userData = {
        email,
        username: `user_${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`,
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(email);
    });

    it('should reject registration with duplicate email', async () => {
      // Create first user
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser1',
          password: await bcrypt.hash('password123', 10)
        }
      });

      const userData = {
        email: 'test@example.com',
        username: 'testuser2',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should reject registration with duplicate username', async () => {
      // Create first user
      await prisma.user.create({
        data: {
          email: 'test1@example.com',
          username: 'testuser',
          password: await bcrypt.hash('password123', 10)
        }
      });

      const userData = {
        email: 'test2@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('username');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: await bcrypt.hash('password123', 10)
        }
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh and /api/refresh', () => {
    const credentials = {
      email: 'refresh@example.com',
      username: 'refreshuser',
      password: 'password123',
    };

    let userId: number;
    let latestToken: string;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      const user = await prisma.user.create({
        data: {
          email: credentials.email,
          username: credentials.username,
          password: hashedPassword,
        },
      });

      userId = user.id;

      const loginResponse = await request(app)
        .post('/api/login')
        .send({ email: credentials.email, password: credentials.password })
        .expect(200);

      latestToken = loginResponse.body.token;
    });

    const expectSuccessfulRefresh = (body: any) => {
      expect(body).toHaveProperty('token');
      expect(typeof body.token).toBe('string');
      expect(body).toHaveProperty('user');
      expect(body.user).toEqual(
        expect.objectContaining({
          id: userId,
          email: credentials.email,
          username: credentials.username,
          elo: expect.any(Number),
        })
      );
    };

    it('should refresh token via /api/auth/refresh', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${latestToken}`)
        .expect(200);

      expectSuccessfulRefresh(response.body);
    });

    it('legacy /api/refresh should proxy to the new handler', async () => {
      const newRouteResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${latestToken}`)
        .expect(200);

      const legacyResponse = await request(app)
        .post('/api/refresh')
        .set('Authorization', `Bearer ${latestToken}`)
        .expect(200);

      expectSuccessfulRefresh(newRouteResponse.body);
      expectSuccessfulRefresh(legacyResponse.body);
      expect(Object.keys(legacyResponse.body).sort()).toEqual(
        Object.keys(newRouteResponse.body).sort()
      );
      expect(legacyResponse.body.user).toEqual(newRouteResponse.body.user);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should reject refresh with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId, email: credentials.email, username: credentials.username },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });
});
