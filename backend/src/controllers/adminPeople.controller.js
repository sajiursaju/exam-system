const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const profileSelect = require("../lib/profileSelect");

const PAGE_SIZE = 10;

// What a TEACHER is allowed to see about a student (no address, no date of birth)
const teacherViewSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    phone: true,
    avatarUrl: true,
    studentCode: true,
    institute: true,
    targetExam: true,
};

const listQuery = z.object({
    role: z.enum(["STUDENT", "TEACHER"]),
    status: z.enum(["PENDING", "ACTIVE", "DEACTIVATED"]).optional(),
    search: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
});

const statusBody = z.object({
    status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

// GET /api/admin/people/counts
exports.counts = asyncHandler(async(req, res) => {
    if (req.user.role === "TEACHER") {
        const students = await prisma.user.count({
            where: { role: "STUDENT", status: "ACTIVE" },
        });
        return res.json({ students });
    }

    const [students, teachers, pending] = await prisma.$transaction([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.user.count({
            where: { status: "PENDING", role: { in: ["STUDENT", "TEACHER"] } },
        }),
    ]);
    res.json({ students, teachers, pending });
});

// GET /api/admin/people?role=STUDENT&status=PENDING&search=rahim&page=1
exports.list = asyncHandler(async(req, res) => {
    const { role, status, search, page } = listQuery.parse(req.query);
    const isTeacher = req.user.role === "TEACHER";

    // A teacher may only look at students
    if (isTeacher && role !== "STUDENT") {
        return res.status(403).json({ message: "Teachers can only view the student list" });
    }

    const where = { role };
    if (isTeacher) {
        where.status = "ACTIVE"; // teachers only see active students
    } else if (status) {
        where.status = status;
    }

    if (search) {
        // MySQL text matching is already case-insensitive, so no "mode" option is needed
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
        ];
    }

    const [total, users] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: isTeacher ? teacherViewSelect : profileSelect,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
    ]);

    res.json({
        users,
        total,
        page,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        viewerRole: req.user.role,
    });
});

// PATCH /api/admin/people/:id/status   body: { "status": "ACTIVE" | "DEACTIVATED" }
// (the route only lets ADMIN reach this)
exports.setStatus = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const { status } = statusBody.parse(req.body);

    const target = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "ADMIN") {
        return res.status(403).json({ message: "Admin accounts cannot be changed here" });
    }

    const user = await prisma.user.update({
        where: { id },
        data: { status },
        select: profileSelect,
    });

    res.json({ user });
});