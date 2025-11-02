/**
 * Clear all user data from the database
 * Run with: npx ts-node server/scripts/clear_database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  try {
    // Delete in correct order to handle foreign key constraints
    // 1. Delete MatchPlayer records (references User and Match)
    const matchPlayersDeleted = await prisma.matchPlayer.deleteMany({});
    console.log(`✅ Deleted ${matchPlayersDeleted.count} MatchPlayer records`);

    // 2. Delete Match records
    const matchesDeleted = await prisma.match.deleteMany({});
    console.log(`✅ Deleted ${matchesDeleted.count} Match records`);

    // 3. Delete User records
    const usersDeleted = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${usersDeleted.count} User records`);

    console.log('🎉 Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

