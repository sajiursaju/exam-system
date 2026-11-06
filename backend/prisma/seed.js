// Creates the first ADMIN account, or RESETS its password if it already exists.
// Safe to run many times.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

const ADMIN_EMAIL = "admin@exam.com";
const NEW_PASSWORD = "Admin@12345"; // <-- type the password you want here

async function main() {
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

    await prisma.admin.upsert({
        where: { email: ADMIN_EMAIL },
        // If the admin already exists, overwrite the password and make sure it is active
        update: { passwordHash, status: "ACTIVE" },
        create: {
            name: "Super Admin",
            email: ADMIN_EMAIL,
            passwordHash,
            status: "ACTIVE",
        },
    });

    console.log(`Admin ready: ${ADMIN_EMAIL} / ${NEW_PASSWORD}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());