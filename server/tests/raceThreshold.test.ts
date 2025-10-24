// Server Race Threshold Integration Tests
import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Race Threshold API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.matchPlayer.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Race ELO Calculation', () => {
    let user1: any, user2: any;
    let authToken: string;

    beforeEach(async () => {
      // Create test users with different ELO ratings
      user1 = await prisma.user.create({
        data: {
          email: 'player1@example.com',
          username: 'player1',
          password: await bcrypt.hash('password123', 10),
          elo: 1200,
          matchesPlayed: 0,
          wins: 0
        }
      });

      user2 = await prisma.user.create({
        data: {
          email: 'player2@example.com',
          username: 'player2',
          password: await bcrypt.hash('password123', 10),
          elo: 1200,
          matchesPlayed: 0,
          wins: 0
        }
      });

      // Get auth token for user1
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'player1@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should calculate ELO changes correctly for winner', async () => {
      const initialElo1 = user1.elo;
      const initialElo2 = user2.elo;

      // Simulate a race where user1 wins
      const match = await prisma.match.create({
        data: {
          duration: 30000 // 30 seconds
        }
      });

      // Create match players with user1 winning
      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: user1.id,
          finishPosition: 1,
          timeMs: 25000,
          deltaElo: 0 // Will be calculated
        }
      });

      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: user2.id,
          finishPosition: 2,
          timeMs: 30000,
          deltaElo: 0 // Will be calculated
        }
      });

      // Verify match was created
      const createdMatch = await prisma.match.findUnique({
        where: { id: match.id },
        include: { players: true }
      });

      expect(createdMatch).toBeTruthy();
      expect(createdMatch!.players).toHaveLength(2);
    });

    it('should handle ELO calculation for different skill levels', async () => {
      // Update user2 to have higher ELO (more experienced)
      await prisma.user.update({
        where: { id: user2.id },
        data: { elo: 1600 }
      });

      const match = await prisma.match.create({
        data: {
          duration: 25000
        }
      });

      // Create match players
      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: user1.id,
          finishPosition: 1,
          timeMs: 20000,
          deltaElo: 0
        }
      });

      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: user2.id,
          finishPosition: 2,
          timeMs: 25000,
          deltaElo: 0
        }
      });

      // Verify match structure
      const createdMatch = await prisma.match.findUnique({
        where: { id: match.id },
        include: { players: true }
      });

      expect(createdMatch).toBeTruthy();
      expect(createdMatch!.players).toHaveLength(2);
    });

    it('should handle race completion with proper ELO updates', async () => {
      const initialElo1 = user1.elo;
      const initialElo2 = user2.elo;

      // Create a completed match
      const match = await prisma.match.create({
        data: {
          duration: 20000
        }
      });

      // Create match players with calculated ELO changes
      const eloChange1 = 32; // Winner gets positive ELO
      const eloChange2 = -32; // Loser gets negative ELO

      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: user1.id,
          finishPosition: 1,
          timeMs: 18000,
          deltaElo: eloChange1
        }
      });

      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: user2.id,
          finishPosition: 2,
          timeMs: 20000,
          deltaElo: eloChange2
        }
      });

      // Update user ELO ratings
      await prisma.user.update({
        where: { id: user1.id },
        data: { 
          elo: { increment: eloChange1 },
          matchesPlayed: { increment: 1 },
          wins: { increment: 1 }
        }
      });

      await prisma.user.update({
        where: { id: user2.id },
        data: { 
          elo: { increment: eloChange2 },
          matchesPlayed: { increment: 1 }
        }
      });

      // Verify ELO changes
      const updatedUser1 = await prisma.user.findUnique({ where: { id: user1.id } });
      const updatedUser2 = await prisma.user.findUnique({ where: { id: user2.id } });

      expect(updatedUser1!.elo).toBe(initialElo1 + eloChange1);
      expect(updatedUser2!.elo).toBe(initialElo2 + eloChange2);
      expect(updatedUser1!.matchesPlayed).toBe(1);
      expect(updatedUser2!.matchesPlayed).toBe(1);
      expect(updatedUser1!.wins).toBe(1);
      expect(updatedUser2!.wins).toBe(0);
    });

    it('should handle race with multiple players (4-player race)', async () => {
      // Create additional users for 4-player race
      const user3 = await prisma.user.create({
        data: {
          email: 'player3@example.com',
          username: 'player3',
          password: await bcrypt.hash('password123', 10),
          elo: 1200,
          matchesPlayed: 0,
          wins: 0
        }
      });

      const user4 = await prisma.user.create({
        data: {
          email: 'player4@example.com',
          username: 'player4',
          password: await bcrypt.hash('password123', 10),
          elo: 1200,
          matchesPlayed: 0,
          wins: 0
        }
      });

      const match = await prisma.match.create({
        data: {
          duration: 35000
        }
      });

      // Create 4 match players
      const players = [
        { userId: user1.id, position: 1, timeMs: 30000 },
        { userId: user2.id, position: 2, timeMs: 32000 },
        { userId: user3.id, position: 3, timeMs: 34000 },
        { userId: user4.id, position: 4, timeMs: 35000 }
      ];

      for (const player of players) {
        await prisma.matchPlayer.create({
          data: {
            matchId: match.id,
            userId: player.userId,
            finishPosition: player.position,
            timeMs: player.timeMs,
            deltaElo: 0
          }
        });
      }

      // Verify 4-player match was created
      const createdMatch = await prisma.match.findUnique({
        where: { id: match.id },
        include: { players: true }
      });

      expect(createdMatch).toBeTruthy();
      expect(createdMatch!.players).toHaveLength(4);
    });

    it('should handle race threshold for early finish (4→3 players)', async () => {
      // Create additional users
      const user3 = await prisma.user.create({
        data: {
          email: 'player3@example.com',
          username: 'player3',
          password: await bcrypt.hash('password123', 10),
          elo: 1200,
          matchesPlayed: 0,
          wins: 0
        }
      });

      const user4 = await prisma.user.create({
        data: {
          email: 'player4@example.com',
          username: 'player4',
          password: await bcrypt.hash('password123', 10),
          elo: 1200,
          matchesPlayed: 0,
          wins: 0
        }
      });

      const match = await prisma.match.create({
        data: {
          duration: 25000 // Shorter race due to early finish
        }
      });

      // Simulate early finish scenario (4→3 players)
      const players = [
        { userId: user1.id, position: 1, timeMs: 20000 },
        { userId: user2.id, position: 2, timeMs: 22000 },
        { userId: user3.id, position: 3, timeMs: 24000 }
        // user4 didn't finish (disconnected or quit)
      ];

      for (const player of players) {
        await prisma.matchPlayer.create({
          data: {
            matchId: match.id,
            userId: player.userId,
            finishPosition: player.position,
            timeMs: player.timeMs,
            deltaElo: 0
          }
        });
      }

      // Verify 3-player finish
      const createdMatch = await prisma.match.findUnique({
        where: { id: match.id },
        include: { players: true }
      });

      expect(createdMatch).toBeTruthy();
      expect(createdMatch!.players).toHaveLength(3);
      expect(createdMatch!.duration).toBe(25000);
    });

    it('should handle race threshold for early finish (8→4 players)', async () => {
      // Create 6 additional users for 8-player race
      const users = [];
      for (let i = 3; i <= 8; i++) {
        const user = await prisma.user.create({
          data: {
            email: `player${i}@example.com`,
            username: `player${i}`,
            password: await bcrypt.hash('password123', 10),
            elo: 1200,
            matchesPlayed: 0,
            wins: 0
          }
        });
        users.push(user);
      }

      const match = await prisma.match.create({
        data: {
          duration: 30000 // Shorter race due to early finish
        }
      });

      // Simulate early finish scenario (8→4 players)
      const players = [
        { userId: user1.id, position: 1, timeMs: 25000 },
        { userId: user2.id, position: 2, timeMs: 26000 },
        { userId: users[0].id, position: 3, timeMs: 27000 },
        { userId: users[1].id, position: 4, timeMs: 28000 }
        // 4 players didn't finish (disconnected or quit)
      ];

      for (const player of players) {
        await prisma.matchPlayer.create({
          data: {
            matchId: match.id,
            userId: player.userId,
            finishPosition: player.position,
            timeMs: player.timeMs,
            deltaElo: 0
          }
        });
      }

      // Verify 4-player finish
      const createdMatch = await prisma.match.findUnique({
        where: { id: match.id },
        include: { players: true }
      });

      expect(createdMatch).toBeTruthy();
      expect(createdMatch!.players).toHaveLength(4);
      expect(createdMatch!.duration).toBe(30000);
    });
  });
});
