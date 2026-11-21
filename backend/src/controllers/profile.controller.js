// backend/src/controllers/profile.controller.js
const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { avatarDir, avatarUrlPrefix } = require("../middleware/upload");

// Validation helpers
const text = (max) => z.string().trim().max(max).optional().transform((v) => (v === "" ? null : v));
const phone = z.string().trim().max(20).optional().refine(
    (v) => v === undefined || v === "" || /^[0-9+\-\s()]{6,20}$/.test(v),
    "Enter a valid phone number"
).transform((v) => (v === "" ? null : v));

const dateField = z.string().trim().optional().transform((v, ctx) => {
    if (v === undefined) return undefined;
    if (v === "") return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
        ctx.addIssue({ code: "custom", message: "Invalid date" });
        return z.NEVER;
    }
    return d;
});

const baseShape = {
    name: z.string().trim().min(2).max(100).optional(),
    phone,
    address: text(500),
};

const studentShape = {
    studentCode: text(50),
    institute: text(150),
    targetExam: text(100),
    dateOfBirth: dateField,
};

const teacherShape = {
    designation: text(100),
    subject: text(100),
    qualification: text(150),
    bio: text(1000),
};

const schemaByRole = {
    ADMIN: z.object(baseShape),
    STUDENT: z.object({...baseShape, ...studentShape }),
    TEACHER: z.object({...baseShape, ...teacherShape }),
};

// GET /api/profile/me
exports.getMe = asyncHandler(async(req, res) => {
    let user;
    if (req.user.role === "ADMIN") {
        user = await prisma.admin.findUnique({ where: { id: req.user.id } });
    } else if (req.user.role === "TEACHER") {
        user = await prisma.teacher.findUnique({ where: { id: req.user.id } });
    } else {
        user = await prisma.student.findUnique({ where: { id: req.user.id } });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const { passwordHash, ...profile } = user;
    res.json({ user: {...profile, role: req.user.role } });
});

// PUT /api/profile/me
exports.updateMe = asyncHandler(async(req, res) => {
    // 1. Validate the incoming body
    const data = schemaByRole[req.user.role].parse(req.body);

    // 2. Update the correct table based on role
    let updatedUser;
    if (req.user.role === "ADMIN") {
        updatedUser = await prisma.admin.update({ where: { id: req.user.id }, data });
    } else if (req.user.role === "TEACHER") {
        updatedUser = await prisma.teacher.update({ where: { id: req.user.id }, data });
    } else {
        // This handles the STUDENT
        updatedUser = await prisma.student.update({ where: { id: req.user.id }, data });
    }

    const { passwordHash, ...profile } = updatedUser;
    res.json({ user: {...profile, role: req.user.role } });
});

// POST /api/profile/me/avatar
exports.uploadAvatar = asyncHandler(async(req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const role = req.user.role;
    const model = role === "ADMIN" ? prisma.admin : role === "TEACHER" ? prisma.teacher : prisma.student;

    const old = await model.findUnique({
        where: { id: req.user.id },
        select: { avatarUrl: true },
    });

    const updatedUser = await model.update({
        where: { id: req.user.id },
        data: { avatarUrl: avatarUrlPrefix + req.file.filename },
    });

    if (old && old.avatarUrl && old.avatarUrl.startsWith(avatarUrlPrefix)) {
        const oldFile = path.join(avatarDir, path.basename(old.avatarUrl));
        fs.promises.unlink(oldFile).catch(() => {});
    }

    const { passwordHash, ...profile } = updatedUser;
    res.json({ user: {...profile, role } });
});