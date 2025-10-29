/**
 * Unit tests for match history endpoint
 * 
 * Tests verify:
 * - Correct response format with matchId, timestamp, placement, eloDelta, opponents
 * - Matches are ordered by createdAt descending (newest first)
 * - Limit query parameter works correctly
 * - Only matches for the requested user are returned
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Import the Express app (we'll need to refactor server.ts to export it)
// For now, we'll test the endpoint logic through a test server setup
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

// Helper to create a test user and token
async function createTestUser(email: string, username: string, elo: number = 1200) {
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: 'hashed_password',
      elo,
    },
  });
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return { user, token };
}

// Helper to create a test match with players
async function createTestMatch(playerData: Array<{ userId: number; finishPosition: number; deltaElo: number }>) {
  const match = await prisma.match.create({
    data: {
      duration: 5000,
      players: {
        create: playerData.map((p) => ({
          userId: p.userId,
          finishPosition: p.finishPosition,
          deltaElo: p.deltaElo,
          timeMs: 5000,
        })),
      },
    },
    include: {
      players: true,
    },
  });
  return match;
}

describe('Match History Endpoint', () => {
  let testUser1: any;
  let testUser2: any;
  let testUser3: any;
  let user1Token: string;

  beforeAll(async () => {
    // Create test users
    const user1Result = await createTestUser('user1@test.com', 'User1', 1200);
    testUser1 = user1Result.user;
    user1Token = user1Result.token;

    const user2Result = await createTestUser('user2@test.com', 'User2', 1300);
    testUser2 = user2Result.user;

    const user3Result = await createTestUser('user3@test.com', 'User3', 1100);
    testUser3 = user3Result.user;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.matchPlayer.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up matches before each test
    await prisma.matchPlayer.deleteMany({});
    await prisma.match.deleteMany({});
  });

  it('should return matches in descending order (newest first)', async () => {
    // Create matches with delays to ensure different timestamps
    const match1 = await createTestMatch([
      { userId: testUser1.id, finishPosition: 1, deltaElo: 10 },
      { userId: testUser2.id, finishPosition: 2, deltaElo: -10 },
    ]);

    // Small delay to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const match2 = await createTestMatch([
      { userId: testUser1.id, finishPosition: 2, deltaElo: -8 },
      { userId: testUser3.id, finishPosition: 1, deltaElo: 8 },
    ]);

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    const match3 = await createTestMatch([
      { userId: testUser1.id, finishPosition: 1, deltaElo: 15 },
      { userId: testUser2.id, finishPosition: 2, deltaElo: -15 },
    ]);

    // Note: Since we're testing the query logic, we'll verify the Prisma query directly
    // In a full integration test, you'd make HTTP requests to the endpoint
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: testUser1.id,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Verify ordering: match3 (newest) should be first
    expect(matches.length).toBe(3);
    expect(matches[0].id).toBe(match3.id);
    expect(matches[1].id).toBe(match2.id);
    expect(matches[2].id).toBe(match1.id);
  });

  it('should format response correctly with required fields', async () => {
    const match = await createTestMatch([
      { userId: testUser1.id, finishPosition: 1, deltaElo: 10 },
      { userId: testUser2.id, finishPosition: 2, deltaElo: -10 },
    ]);

    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: testUser1.id,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Format as the endpoint does
    const formattedMatches = matches.map((match) => {
      const userPlayer = match.players.find((p) => p.userId === testUser1.id);
      const opponents = match.players
        .filter((p) => p.userId !== testUser1.id)
        .map((p) => ({
          username: p.user.username || 'Unknown',
          elo: p.user.elo,
        }));

      return {
        matchId: match.id,
        timestamp: match.createdAt.toISOString(),
        placement: userPlayer?.finishPosition || null,
        eloDelta: userPlayer?.deltaElo || null,
        opponents: opponents,
      };
    });

    expect(formattedMatches.length).toBe(1);
    const formatted = formattedMatches[0];

    // Verify response structure
    expect(formatted).toHaveProperty('matchId');
    expect(formatted).toHaveProperty('timestamp');
    expect(formatted).toHaveProperty('placement');
    expect(formatted).toHaveProperty('eloDelta');
    expect(formatted).toHaveProperty('opponents');
    expect(Array.isArray(formatted.opponents)).toBe(true);

    // Verify values
    expect(formatted.matchId).toBe(match.id);
    expect(typeof formatted.timestamp).toBe('string');
    expect(formatted.placement).toBe(1);
    expect(formatted.eloDelta).toBe(10);
    expect(formatted.opponents.length).toBe(1);
    expect(formatted.opponents[0]).toHaveProperty('username');
    expect(formatted.opponents[0]).toHaveProperty('elo');
    expect(formatted.opponents[0].username).toBe(testUser2.username);
  });

  it('should only return matches for the requested user', async () => {
    // Create a match where testUser1 is NOT involved
    await createTestMatch([
      { userId: testUser2.id, finishPosition: 1, deltaElo: 8 },
      { userId: testUser3.id, finishPosition: 2, deltaElo: -8 },
    ]);

    // Create a match where testUser1 IS involved
    const user1Match = await createTestMatch([
      { userId: testUser1.id, finishPosition: 1, deltaElo: 10 },
      { userId: testUser2.id, finishPosition: 2, deltaElo: -10 },
    ]);

    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: testUser1.id,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe(user1Match.id);
    
    // Verify testUser1 is in the match
    const hasUser1 = matches[0].players.some((p) => p.userId === testUser1.id);
    expect(hasUser1).toBe(true);
  });

  it('should handle limit query parameter', async () => {
    // Create 5 matches
    for (let i = 0; i < 5; i++) {
      await createTestMatch([
        { userId: testUser1.id, finishPosition: 1, deltaElo: 10 },
        { userId: testUser2.id, finishPosition: 2, deltaElo: -10 },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Test with limit of 3
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: testUser1.id,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    expect(matches.length).toBe(3);
  });

  it('should handle matches with multiple opponents', async () => {
    const match = await createTestMatch([
      { userId: testUser1.id, finishPosition: 2, deltaElo: 0 },
      { userId: testUser2.id, finishPosition: 1, deltaElo: 10 },
      { userId: testUser3.id, finishPosition: 3, deltaElo: -10 },
    ]);

    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: testUser1.id,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const formattedMatches = matches.map((match) => {
      const userPlayer = match.players.find((p) => p.userId === testUser1.id);
      const opponents = match.players
        .filter((p) => p.userId !== testUser1.id)
        .map((p) => ({
          username: p.user.username || 'Unknown',
          elo: p.user.elo,
        }));

      return {
        matchId: match.id,
        timestamp: match.createdAt.toISOString(),
        placement: userPlayer?.finishPosition || null,
        eloDelta: userPlayer?.deltaElo || null,
        opponents: opponents,
      };
    });

    expect(formattedMatches[0].opponents.length).toBe(2);
    expect(formattedMatches[0].placement).toBe(2);
  });

  it('should return empty array when user has no matches', async () => {
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: testUser1.id,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    expect(matches.length).toBe(0);
  });
});
