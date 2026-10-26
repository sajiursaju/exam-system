const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");

const select = { id: true, name: true, email: true, role: true, status: true, createdAt: true };

// GET /api/users?role=STUDENT&status=PENDING
exports.list = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const where = {};
  if (["ADMIN", "TEACHER", "STUDENT"].includes(role)) where.role = role;
  if (["PENDING", "ACTIVE", "DEACTIVATED"].includes(status)) where.status = status;

  const users = await prisma.user.findMany({ where, select, orderBy: { createdAt: "desc" } });
  res.json({ users });
});

// PATCH /api/users/:id/status   body: { "status": "ACTIVE" | "DEACTIVATED" }
const statusSchema = z.object({ status: z.enum(["ACTIVE", "DEACTIVATED"]) });

exports.setStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status } = statusSchema.parse(req.body);
  if (id === req.user.id) {
    return res.status(400).json({ message: "You cannot change your own status" });
  }
  const user = await prisma.user.update({ where: { id }, data: { status }, select });
  res.json({ user });
});
