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
    });

    it('should return leaderboard ordered by ELO', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body).toHaveProperty('leaderboard');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.leaderboard).toHaveLength(3);
      
      // Check ordering (highest ELO first)
      expect(response.body.leaderboard[0].elo).toBe(1600);
      expect(response.body.leaderboard[1].elo).toBe(1500);
      expect(response.body.leaderboard[2].elo).toBe(1400);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/leaderboard?limit=2')
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(2);
      expect(response.body.pagination.hasMore).toBe(true);
    });

    it('should handle pagination with cursor', async () => {
      const firstPage = await request(app)
        .get('/api/leaderboard?limit=2')
        .expect(200);

      const secondPage = await request(app)
        .get(`/api/leaderboard?limit=2&cursor=${firstPage.body.pagination.nextCursor}`)
        .expect(200);

      expect(secondPage.body.leaderboard).toHaveLength(1);
      expect(firstPage.body.leaderboard[0].id).not.toBe(secondPage.body.leaderboard[0].id);
    });

    it('should validate limit parameter', async () => {
      await request(app)
        .get('/api/leaderboard?limit=101')
        .expect(400);

      await request(app)
        .get('/api/leaderboard?limit=0')
        .expect(400);
    });

    it('should return empty leaderboard when no users exist', async () => {
      // Clear all users
      await prisma.user.deleteMany();

      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(0);
      expect(response.body.pagination.hasMore).toBe(false);
    });
  });
});
