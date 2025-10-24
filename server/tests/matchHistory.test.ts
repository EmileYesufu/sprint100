// Server Match History Integration Tests
import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Match History API', () => {
  let testUser: any;
  let testOpponent: any;
  let authToken: string;

  beforeEach(async () => {
    // Clean up test data
    await prisma.matchPlayer.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    testUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        elo: 1200
      }
    });

    testOpponent = await prisma.user.create({
      data: {
        email: 'opponent@example.com',
        username: 'opponent',
        password: await bcrypt.hash('password123', 10),
        elo: 1300
      }
    });

    // Get auth token for authentication
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/users/:userId/matches', () => {
    it('should return user match history', async () => {
      // Create test match
      const match = await prisma.match.create({
        data: {
          duration: 45000, // 45 seconds
          players: {
            create: [
              {
                userId: testUser.id,
                finishPosition: 1,
                timeMs: 45000,
                deltaElo: 16
              },
              {
                userId: testOpponent.id,
                finishPosition: 2,
                timeMs: 46000,
                deltaElo: -16
              }
            ]
          }
        }
      });

      const response = await request(app)
        .get(`/api/users/${testUser.id}/matches`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      
      const matchData = response.body[0];
      expect(matchData.id).toBe(match.id);
      expect(matchData.players[0].finishPosition).toBe(1);
      expect(matchData.players[0].deltaElo).toBe(16);
      expect(matchData.players).toHaveLength(2);
      expect(matchData.players[1].user.username).toBe('opponent');
    });

    it('should return empty array for user with no matches', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}/matches`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should validate user ID parameter', async () => {
      await request(app)
        .get('/api/users/invalid/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app)
        .get('/api/users/0/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should respect limit parameter', async () => {
      // Create multiple matches
      for (let i = 0; i < 5; i++) {
        await prisma.match.create({
          data: {
            duration: 45000,
            players: {
              create: [
                { userId: testUser.id, finishPosition: 1, deltaElo: 16 },
                { userId: testOpponent.id, finishPosition: 2, deltaElo: -16 }
              ]
            }
          }
        });
      }

      const response = await request(app)
        .get(`/api/users/${testUser.id}/matches?limit=3`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should handle pagination with cursor', async () => {
      // Create multiple matches
      for (let i = 0; i < 5; i++) {
        await prisma.match.create({
          data: {
            duration: 45000,
            players: {
              create: [
                { userId: testUser.id, finishPosition: 1, deltaElo: 16 },
                { userId: testOpponent.id, finishPosition: 2, deltaElo: -16 }
              ]
            }
          }
        });
      }

      const firstPage = await request(app)
        .get(`/api/users/${testUser.id}/matches?limit=2`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const secondPage = await request(app)
        .get(`/api/users/${testUser.id}/matches?limit=2`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(firstPage.body).toHaveLength(2);
      expect(secondPage.body).toHaveLength(2);
    });
  });
});
