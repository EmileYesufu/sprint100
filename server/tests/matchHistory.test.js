"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server Match History Integration Tests
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../src/server");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
describe('Match History API', () => {
    let testUser;
    let testOpponent;
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
                password: await bcryptjs_1.default.hash('password123', 10),
                elo: 1200
            }
        });
        testOpponent = await prisma.user.create({
            data: {
                email: 'opponent@example.com',
                username: 'opponent',
                password: await bcryptjs_1.default.hash('password123', 10),
                elo: 1300
            }
        });
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
            const response = await (0, supertest_1.default)(server_1.app)
                .get(`/api/users/${testUser.id}/matches`)
                .expect(200);
            expect(response.body).toHaveProperty('matches');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.matches).toHaveLength(1);
            const matchData = response.body.matches[0];
            expect(matchData.matchId).toBe(match.id);
            expect(matchData.placement).toBe(1);
            expect(matchData.eloDelta).toBe(16);
            expect(matchData.opponents).toHaveLength(1);
            expect(matchData.opponents[0].username).toBe('opponent');
        });
        it('should return empty array for user with no matches', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .get(`/api/users/${testUser.id}/matches`)
                .expect(200);
            expect(response.body.matches).toHaveLength(0);
            expect(response.body.pagination.hasMore).toBe(false);
        });
        it('should validate user ID parameter', async () => {
            await (0, supertest_1.default)(server_1.app)
                .get('/api/users/invalid/matches')
                .expect(400);
            await (0, supertest_1.default)(server_1.app)
                .get('/api/users/0/matches')
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
            const response = await (0, supertest_1.default)(server_1.app)
                .get(`/api/users/${testUser.id}/matches?limit=3`)
                .expect(200);
            expect(response.body.matches).toHaveLength(3);
            expect(response.body.pagination.hasMore).toBe(true);
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
            const firstPage = await (0, supertest_1.default)(server_1.app)
                .get(`/api/users/${testUser.id}/matches?limit=2`)
                .expect(200);
            const secondPage = await (0, supertest_1.default)(server_1.app)
                .get(`/api/users/${testUser.id}/matches?limit=2&cursor=${firstPage.body.pagination.nextCursor}`)
                .expect(200);
            expect(secondPage.body.matches).toHaveLength(2);
            expect(firstPage.body.matches[0].matchId).not.toBe(secondPage.body.matches[0].matchId);
        });
    });
});
//# sourceMappingURL=matchHistory.test.js.map