/**
 * Clear all users from the database
 * This will also delete related MatchPlayer records due to foreign key constraints
 * Run with: npx ts-node scripts/clear_users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUsers() {
  console.log('🗑️  Clearing all users from database...');

  try {
    // First, delete MatchPlayer records that reference users
    // This is necessary due to foreign key constraints
    const matchPlayersDeleted = await prisma.matchPlayer.deleteMany({});
    console.log(`✅ Deleted ${matchPlayersDeleted.count} MatchPlayer records`);

    // Now delete all users
    const usersDeleted = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${usersDeleted.count} User records`);

    console.log('🎉 All users cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers();

