const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");

const select = { id: true, name: true, email: true, status: true, createdAt: true };

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

// Pick the right table for the role
function modelFor(role) {
    if (role === "ADMIN") return prisma.admin;
    if (role === "TEACHER") return prisma.teacher;
    return prisma.student;
}

// GET /api/users?role=STUDENT&status=PENDING
exports.list = asyncHandler(async(req, res) => {
    const { role, status } = req.query;
    const where = {};
    if (["PENDING", "ACTIVE", "DEACTIVATED"].includes(status)) where.status = status;

    // One table if a role is given, otherwise all three
    const roles = ROLES.includes(role) ? [role] : ROLES;

    const results = await Promise.all(
        roles.map(async(r) => {
            const rows = await modelFor(r).findMany({
                where,
                select,
                orderBy: { createdAt: "desc" },
            });
            // The new tables have no "role" column, so add it here
            return rows.map((row) => ({...row, role: r }));
        })
    );

    const users = results
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ users });
});

// PATCH /api/users/:id/status   body: { "role": "STUDENT", "status": "ACTIVE" | "DEACTIVATED" }
const statusSchema = z.object({
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

exports.setStatus = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const { role, status } = statusSchema.parse(req.body);

    // Same id can exist in two tables, so compare the role too
    if (id === req.user.id && role === req.user.role) {
        return res.status(400).json({ message: "You cannot change your own status" });
    }

    const model = modelFor(role);
    const target = await model.findUnique({ where: { id }, select: { id: true } });
    if (!target) return res.status(404).json({ message: "User not found" });

    const user = await model.update({ where: { id }, data: { status }, select });
    res.json({ user: {...user, role } });
});