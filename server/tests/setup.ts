// Test setup file
// Set test environment BEFORE importing anything
process.env.NODE_ENV = 'testing';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.ALLOWED_ORIGINS = '*';
process.env.RATE_LIMIT_MAX = '5000';
process.env.RATE_LIMIT_WINDOW_MS = '900000'; // 15 minutes
process.env.ENABLE_REQUEST_LOGGING = 'false';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Environment variables are already set above
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean up database between tests
beforeEach(async () => {
  // Clean up test data in reverse order of dependencies
  // Gracefully handle missing tables (for tests that don't require database)
  try {
    await prisma.matchPlayer.deleteMany();
  } catch (error: any) {
    // Ignore errors if table doesn't exist (for pure unit tests)
    if (!error.message?.includes('does not exist')) throw error;
  }
  try {
    await prisma.match.deleteMany();
  } catch (error: any) {
    if (!error.message?.includes('does not exist')) throw error;
  }
  try {
    await prisma.user.deleteMany();
  } catch (error: any) {
    if (!error.message?.includes('does not exist')) throw error;
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);
