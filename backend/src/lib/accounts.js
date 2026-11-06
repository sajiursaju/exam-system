// One place that knows about the three account tables.
// Login, register and the auth middleware all use this file.
const prisma = require("./prisma");

const tables = {
    ADMIN: prisma.admin,
    TEACHER: prisma.teacher,
    STUDENT: prisma.student,
};

// Search the three tables for an email. Returns { role, account } or null.
async function findByEmail(email) {
    for (const role of Object.keys(tables)) {
        const account = await tables[role].findUnique({ where: { email } });
        if (account) return { role, account };
    }
    return null;
}

// Load one account when we already know the role (comes from the JWT).
async function findById(role, id) {
    const table = tables[role];
    if (!table) return null;
    return table.findUnique({ where: { id } });
}

module.exports = { tables, findByEmail, findById };