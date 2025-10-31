// Server Leaderboard Integration Tests
import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Leaderboard API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.matchPlayer.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/leaderboard', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create test users with different ELO ratings
      await prisma.user.createMany({
        data: [
          {
            email: 'player1@example.com',
            username: 'player1',
            password: await bcrypt.hash('password123', 10),
            elo: 1600,
            matchesPlayed: 25,
            wins: 18
          },
          {
            email: 'player2@example.com',
            username: 'player2',
            password: await bcrypt.hash('password123', 10),
            elo: 1400,
            matchesPlayed: 20,
            wins: 12
          },
          {
            email: 'player3@example.com',
            username: 'player3',
            password: await bcrypt.hash('password123', 10),
            elo: 1500,
            matchesPlayed: 15,
            wins: 10
          }
        ]
      });

      // Get auth token for authentication
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'player1@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should return leaderboard ordered by ELO', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Check ordering (highest ELO first)
      expect(response.body.data[0].elo).toBe(1600);
      expect(response.body.data[1].elo).toBe(1500);
      expect(response.body.data[2].elo).toBe(1400);
      expect(response.body.data.map((entry: any) => entry.rank)).toEqual([1, 2, 3]);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/leaderboard')
        .expect(401);
    });

    it('should return user data with correct structure', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0]).toHaveProperty('rank', 1);
      expect(response.body.data[0]).toHaveProperty('username');
      expect(response.body.data[0]).toHaveProperty('elo');
      expect(response.body.data[0]).toHaveProperty('matchesPlayed');
      expect(response.body.data[0]).toHaveProperty('wins');
      expect(response.body.data[0]).not.toHaveProperty('password');
    });

    it('should return empty leaderboard when no users exist', async () => {
      // Clear all users
      await prisma.user.deleteMany();

      const response = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should limit results to top 50 players', async () => {
      // Create 55 users to test the limit
      const users = [];
      for (let i = 4; i <= 55; i++) {
        users.push({
          email: `player${i}@example.com`,
          username: `player${i}`,
          password: await bcrypt.hash('password123', 10),
          elo: 1000 + i,
          matchesPlayed: 0,
          wins: 0
        });
      }

      await prisma.user.createMany({ data: users });

      const response = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(50);
    });
  });
});
