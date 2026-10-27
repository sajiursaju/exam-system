const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const profileSelect = require("../lib/profileSelect");
const { avatarDir, avatarUrlPrefix } = require("../middleware/upload");

// ---------- validation helpers ----------

// Optional text: "" becomes null (clears it), missing stays undefined (unchanged)
const text = (max) =>
    z.string().trim().max(max).optional().transform((v) => (v === "" ? null : v));

const phone = z
    .string()
    .trim()
    .max(20)
    .optional()
    .refine(
        (v) => v === undefined || v === "" || /^[0-9+\-\s()]{6,20}$/.test(v),
        "Enter a valid phone number"
    )
    .transform((v) => (v === "" ? null : v));

// Accepts "YYYY-MM-DD" from an <input type="date">
const dateField = z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
        if (v === undefined) return undefined;
        if (v === "") return null;
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) {
            ctx.addIssue({ code: "custom", message: "Invalid date" });
            return z.NEVER;
        }
        return d;
    });

// ---------- one schema per role ----------

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

// ---------- handlers ----------

// GET /api/profile/me
exports.getMe = asyncHandler(async(req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: profileSelect,
    });
    res.json({ user });
});

// PUT /api/profile/me
exports.updateMe = asyncHandler(async(req, res) => {
    const data = schemaByRole[req.user.role].parse(req.body); // unknown fields are dropped
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: profileSelect,
    });
    res.json({ user });
});

// POST /api/profile/me/avatar
exports.uploadAvatar = asyncHandler(async(req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const old = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { avatarUrl: true },
    });

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl: avatarUrlPrefix + req.file.filename },
        select: profileSelect,
    });

    // Delete the previous image file (basename() blocks path tricks)
    if (old && old.avatarUrl && old.avatarUrl.startsWith(avatarUrlPrefix)) {
        const oldFile = path.join(avatarDir, path.basename(old.avatarUrl));
        fs.promises.unlink(oldFile).catch(() => {});
    }

    res.json({ user });
});