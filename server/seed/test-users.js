"use strict";
/**
 * Seed test users for external testers
 * Run with: npm run seed:test
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const testUsers = [
    { email: "tester1@sprint100.test", username: "tester1", password: "testpass123", elo: 1200 },
    { email: "tester2@sprint100.test", username: "tester2", password: "testpass123", elo: 1250 },
    { email: "tester3@sprint100.test", username: "tester3", password: "testpass123", elo: 1150 },
];
async function seed() {
    console.log("🌱 Seeding test users...\n");
    for (const userData of testUsers) {
        try {
            // Check if user already exists
            const existing = await prisma.user.findUnique({ where: { email: userData.email } });
            if (existing) {
                console.log(`   ⏭️  ${userData.username} already exists, skipping`);
                continue;
            }
            // Create user
            const hash = await bcryptjs_1.default.hash(userData.password, 10);
            const user = await prisma.user.create({
                data: {
                    email: userData.email,
                    username: userData.username,
                    password: hash,
                    elo: userData.elo,
                },
            });
            console.log(`   ✅ Created ${user.username} (${user.email})`);
        }
        catch (error) {
            console.error(`   ❌ Failed to create ${userData.username}:`, error.message);
        }
    }
    console.log("\n📋 Test User Credentials:\n");
    console.log("   Username: tester1");
    console.log("   Email: tester1@sprint100.test");
    console.log("   Password: testpass123\n");
    console.log("   Username: tester2");
    console.log("   Email: tester2@sprint100.test");
    console.log("   Password: testpass123\n");
    console.log("   Username: tester3");
    console.log("   Email: tester3@sprint100.test");
    console.log("   Password: testpass123\n");
    console.log("✅ Seeding complete! Share these credentials with testers.\n");
}
seed()
    .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test-users.js.map