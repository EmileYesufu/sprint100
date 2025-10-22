"use strict";
// Sprint100 Database Seed Script
// Run with: npx prisma db seed
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create test users
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@sprint100.com' },
            update: {},
            create: {
                email: 'admin@sprint100.com',
                username: 'admin',
                password: hashedPassword,
                elo: 1500,
                matchesPlayed: 25,
                wins: 18,
            },
        }),
        prisma.user.upsert({
            where: { email: 'player1@sprint100.com' },
            update: {},
            create: {
                email: 'player1@sprint100.com',
                username: 'player1',
                password: hashedPassword,
                elo: 1400,
                matchesPlayed: 15,
                wins: 8,
            },
        }),
        prisma.user.upsert({
            where: { email: 'player2@sprint100.com' },
            update: {},
            create: {
                email: 'player2@sprint100.com',
                username: 'player2',
                password: hashedPassword,
                elo: 1300,
                matchesPlayed: 12,
                wins: 5,
            },
        }),
    ]);
    console.log('✅ Created users:', users.map(u => u.username));
    // Create sample matches
    const match = await prisma.match.create({
        data: {
            duration: 45000, // 45 seconds
            players: {
                create: [
                    {
                        userId: users[0].id,
                        finishPosition: 1,
                        timeMs: 45000,
                        deltaElo: 16,
                    },
                    {
                        userId: users[1].id,
                        finishPosition: 2,
                        timeMs: 46000,
                        deltaElo: -16,
                    },
                ],
            },
        },
    });
    console.log('✅ Created sample match:', match.id);
    console.log('🎉 Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map