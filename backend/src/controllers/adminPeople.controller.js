const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");

const PAGE_SIZE = 10;

// Fields shown in the list, per table
const studentSelect = {
    id: true,
    name: true,
    email: true,
    status: true,
    createdAt: true,
    phone: true,
    avatarUrl: true,
    studentCode: true,
    institute: true,
    targetExam: true,
};

const teacherSelect = {
    id: true,
    name: true,
    email: true,
    status: true,
    createdAt: true,
    phone: true,
    avatarUrl: true,
    subject: true,
    designation: true,
};

// Pick the right table (and fields) for the role
function modelFor(role) {
    return role === "STUDENT" ? { model: prisma.student, select: studentSelect } : { model: prisma.teacher, select: teacherSelect };
}

const listQuery = z.object({
    role: z.enum(["STUDENT", "TEACHER"]),
    status: z.enum(["PENDING", "ACTIVE", "DEACTIVATED"]).optional(),
    search: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
});

const statusBody = z.object({
    role: z.enum(["STUDENT", "TEACHER"]),
    status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

// GET /api/admin/people/counts
exports.counts = asyncHandler(async(req, res) => {
    if (req.user.role === "TEACHER") {
        const students = await prisma.student.count({
            where: { status: "ACTIVE" },
        });
        return res.json({ students });
    }

    const [students, teachers, pendingStudents, pendingTeachers] =
    await prisma.$transaction([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.student.count({ where: { status: "PENDING" } }),
        prisma.teacher.count({ where: { status: "PENDING" } }),
    ]);

    res.json({
        students,
        teachers,
        pending: pendingStudents + pendingTeachers,
    });
});

// GET /api/admin/people?role=STUDENT&status=PENDING&search=rahim&page=1
exports.list = asyncHandler(async(req, res) => {
    const { role, status, search, page } = listQuery.parse(req.query);
    const isTeacher = req.user.role === "TEACHER";

    // A teacher may only look at students
    if (isTeacher && role !== "STUDENT") {
        return res.status(403).json({ message: "Teachers can only view the student list" });
    }

    const where = {};
    if (isTeacher) {
        where.status = "ACTIVE"; // teachers only see active students
    } else if (status) {
        where.status = status;
    }

    if (search) {
        // MySQL text matching is already case-insensitive
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
        ];
    }

    const { model, select } = modelFor(role);

    const [total, rows] = await prisma.$transaction([
        model.count({ where }),
        model.findMany({
            where,
            select,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
    ]);

    // The new tables have no "role" column, so add it for the frontend
    const users = rows.map((r) => ({...r, role }));

    res.json({
        users,
        total,
        page,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        viewerRole: req.user.role,
    });
});

// PATCH /api/admin/people/:id/status   body: { "role": "STUDENT", "status": "ACTIVE" | "DEACTIVATED" }
// (the route only lets ADMIN reach this)
exports.setStatus = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const { role, status } = statusBody.parse(req.body);
    const { model, select } = modelFor(role);

    const target = await model.findUnique({ where: { id }, select: { id: true } });
    if (!target) return res.status(404).json({ message: "User not found" });

    const row = await model.update({
        where: { id },
        data: { status },
        select,
    });

    res.json({ user: {...row, role } });
});