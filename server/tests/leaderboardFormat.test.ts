import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Leaderboard API Format', () => {
  let authToken: string;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
      data: [
        {
          email: 'format_player1@example.com',
          username: 'format_player1',
          password: passwordHash,
          elo: 1800,
          matchesPlayed: 42,
          wins: 30,
        },
        {
          email: 'format_player2@example.com',
          username: 'format_player2',
          password: passwordHash,
          elo: 1750,
          matchesPlayed: 36,
          wins: 24,
        },
        {
          email: 'format_player3@example.com',
          username: 'format_player3',
          password: passwordHash,
          elo: 1650,
          matchesPlayed: 28,
          wins: 18,
        },
      ],
    });

    const loginResponse = await request(app)
      .post('/api/login')
      .send({ email: 'format_player1@example.com', password: 'password123' });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns 200 with success payload and leaderboard entries', async () => {
    const response = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    response.body.data.forEach((entry: any) => {
      expect(typeof entry.rank).toBe('number');
      expect(typeof entry.username).toBe('string');
      expect(typeof entry.elo).toBe('number');
      expect(typeof entry.matchesPlayed).toBe('number');
      expect(typeof entry.wins).toBe('number');
    });
  });

  it('orders players by rank sequentially and ELO descending', async () => {
    const response = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const leaderboard = response.body.data;
    const ranks = leaderboard.map((entry: any) => entry.rank);
    const elos = leaderboard.map((entry: any) => entry.elo);

    expect(ranks).toEqual([1, 2, 3]);
    expect(elos).toEqual([...elos].sort((a, b) => b - a));
  });
});

