const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

console.log("Notice model:", !!prisma.notice);

prisma.$disconnect();
