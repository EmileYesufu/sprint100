import prisma from "../src/prismaClient";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("DemoPassword123!", 10);

  const demoUsers = [
    { email: "demo1@example.com", username: "DemoRunner1", elo: 1250 },
    { email: "demo2@example.com", username: "DemoRunner2", elo: 1320 },
    { email: "demo3@example.com", username: "DemoRunner3", elo: 1180 },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { elo: user.elo },
      create: {
        email: user.email,
        username: user.username,
        password: passwordHash,
        elo: user.elo,
      },
    });
  }

  console.log("Demo users seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
