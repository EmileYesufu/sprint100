import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERUSER_EMAIL || "admin@sprint100.app";
  const password = process.env.SUPERUSER_PASSWORD || "ChangeMe123!";
  const hashed = await bcrypt.hash(password, 10);

  const adminData: any = {
    email,
    username: "Admin",
    password: hashed,
    elo: 2000,
    role: "ADMIN",
  };

  const user = await prisma.user.upsert({
    where: { email },
    update: adminData,
    create: adminData,
  });

  console.log(`✅ Superuser ensured: ${user.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error("Superuser creation failed:", error);
    return prisma.$disconnect();
  });


