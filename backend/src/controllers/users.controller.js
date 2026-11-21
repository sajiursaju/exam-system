// backend/src/controllers/users.controller.js
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

function modelFor(role) {
    if (role === "ADMIN") return prisma.admin;
    if (role === "TEACHER") return prisma.teacher;
    return prisma.student;
}

const baseSelect = {
    id: true,
    name: true,
    email: true,
    status: true,
    createdAt: true,
    phone: true,
    avatarUrl: true,
};

function selectFor(role) {
    if (role === "STUDENT") {
        return {
            ...baseSelect,
            institute: true,
            targetExam: true,
            studentCode: true,
        };
    }
    if (role === "TEACHER") {
        return {
            ...baseSelect,
            designation: true,
            subject: true,
            qualification: true,
        };
    }
    return baseSelect;
}

// GET /api/users
exports.list = asyncHandler(async(req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const { role, status } = req.query;
    const where = {};
    if (["PENDING", "ACTIVE", "DEACTIVATED"].includes(status)) where.status = status;

    const roles = ROLES.includes(role) ? [role] : ROLES;

    const results = await Promise.all(
        roles.map(async(r) => {
            const rows = await modelFor(r).findMany({
                where,
                select: selectFor(r),
                orderBy: { createdAt: "desc" },
            });
            return rows.map((row) => ({...row, role: r }));
        })
    );

    const users = results
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ users });
});

// PATCH /api/users/:id/status
const statusSchema = z.object({
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

exports.setStatus = asyncHandler(async(req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const { role, status } = statusSchema.parse(req.body);

    if (id === req.user.id && role === req.user.role) {
        return res.status(400).json({ message: "You cannot change your own status" });
    }

    const model = modelFor(role);
    const target = await model.findUnique({ where: { id }, select: { id: true } });
    if (!target) return res.status(404).json({ message: "User not found" });

    const user = await model.update({
        where: { id },
        data: { status },
        select: selectFor(role),
    });

    res.json({ user: {...user, role } });
});

// DELETE /api/users/:id?role=STUDENT|TEACHER
exports.remove = asyncHandler(async(req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const id = Number(req.params.id);
    const { role } = req.query;

    if (!id || !role) {
        return res.status(400).json({ message: "id and role are required" });
    }

    if (role === "ADMIN") {
        return res.status(403).json({ message: "Cannot delete an Admin account" });
    }

    if (role === "STUDENT") {
        await prisma.$transaction(async(tx) => {
            await tx.studentAnswer.deleteMany({
                where: { attempt: { studentId: id } },
            });
            await tx.examAttempt.deleteMany({
                where: { studentId: id },
            });
            await tx.student.delete({ where: { id } });
        });

    } else if (role === "TEACHER") {
        await prisma.$transaction(async(tx) => {
            await tx.exam.updateMany({
                where: { createdByTeacherId: id },
                data: { createdByTeacherId: null },
            });
            await tx.teacher.delete({ where: { id } });
        });
    }

    res.json({ message: "User deleted successfully" });
});

// GET /api/users/download?targetExam=BCS
exports.download = asyncHandler(async(req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const { targetExam } = req.query;

    // Build the strict filter
    let whereClause = {};

    if (targetExam && targetExam !== "All") {
        whereClause = {
            targetExam: {
                equals: targetExam,
                mode: 'insensitive' // Matches regardless of uppercase/lowercase
            }
        };
    }

    const students = await prisma.student.findMany({
        where: whereClause,
        include: {
            attempts: {
                include: {
                    exam: { select: { title: true, totalMarks: true, passingMarks: true } }
                }
            }
        },
        orderBy: { name: "asc" }
    });

    const header = ["Student Name", "Email", "Target Exam", "Total Attempts", "Passed Exams", "Failed/Pending"];
    const rows = [];

    for (const student of students) {
        let passed = 0;
        let failed = 0;

        for (const attempt of student.attempts) {
            if (attempt.status === "GRADED" || attempt.status === "SUBMITTED") {
                if (attempt.totalScore >= attempt.exam.passingMarks) {
                    passed++;
                } else {
                    failed++;
                }
            } else {
                failed++;
            }
        }

        rows.push([
            student.name,
            student.email,
            student.targetExam || "Not Set",
            student.attempts.length,
            passed,
            failed
        ]);
    }

    const csvContent = [header, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

    const filename = targetExam && targetExam !== "All" ?
        `results-${targetExam.replace(/\s+/g, '-')}.csv` :
        `all-students-results.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    // "sep=," forces Excel to automatically widen columns
    res.send("\uFEFF" + "sep=,\r\n" + csvContent);
});