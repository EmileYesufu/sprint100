"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server Authentication Integration Tests
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../src/server");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
            const response = await (0, supertest_1.default)(server_1.app)
                .post('/api/register')
                .send(userData)
                .expect(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.username).toBe(userData.username);
            expect(response.body.user).not.toHaveProperty('password');
        });
        it('should reject registration with duplicate email', async () => {
            // Create first user
            await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    username: 'testuser1',
                    password: await bcryptjs_1.default.hash('password123', 10)
                }
            });
            const userData = {
                email: 'test@example.com',
                username: 'testuser2',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.app)
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
                    password: await bcryptjs_1.default.hash('password123', 10)
                }
            });
            const userData = {
                email: 'test2@example.com',
                username: 'testuser',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.app)
                .post('/api/register')
                .send(userData)
                .expect(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('username');
        });
        it('should validate required fields', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
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
                    password: await bcryptjs_1.default.hash('password123', 10)
                }
            });
        });
        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.app)
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
            const response = await (0, supertest_1.default)(server_1.app)
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
            const response = await (0, supertest_1.default)(server_1.app)
                .post('/api/login')
                .send(loginData)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
});
//# sourceMappingURL=auth.test.js.map