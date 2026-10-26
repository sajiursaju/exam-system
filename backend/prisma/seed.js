// Creates the first ADMIN account. Safe to run many times.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@exam.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@exam.com",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin seeded: admin@exam.com / Admin@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
