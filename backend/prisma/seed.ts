import { prisma } from "../src/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = "admin@bank.com";

  const exists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (exists) {
    console.log("Admin already exists.");
    return;
  }

  const hashed = await bcrypt.hash("Admin@123", 10);

  await prisma.user.create({
    data: {
      name: "System Admin",
      email: adminEmail,
      mobile: "0500000000",
      password: hashed,
      role: "ADMIN",
      status: "ACTIVE",
      profilePic: null,
    },
  });

  console.log("Admin user created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });