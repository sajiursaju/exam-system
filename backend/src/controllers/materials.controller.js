// backend/src/controllers/materials.controller.js

const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { materialDir } = require("../middleware/materialUpload");

const createSchema = z.object({
    title: z.string().trim().min(2).max(200),
    category: z.string().trim().min(1).max(100),
});

// Deletes a saved PDF from disk
function removeFile(fileName) {
    fs.promises.unlink(path.join(materialDir, fileName)).catch(() => {});
}

// Reads the logged-in student's category
async function studentCategory(studentId) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { targetExam: true },
    });

    return student && student.targetExam ?
        student.targetExam.trim() :
        null;
}

// POST /api/materials
// Admin creates a study material
exports.create = asyncHandler(async(req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "Please choose a PDF file",
        });
    }

    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
        removeFile(req.file.filename);

        return res.status(400).json({
            message: "Title and category are required",
        });
    }

    const material = await prisma.material.create({
        data: {
            title: parsed.data.title,
            category: parsed.data.category,
            fileName: req.file.filename,
            originalName: req.file.originalname.slice(0, 255),
            fileSize: req.file.size,
        },
        select: {
            id: true,
            title: true,
            category: true,
            originalName: true,
            fileSize: true,
            createdAt: true,
        },
    });

    res.status(201).json({ material });
});

// GET /api/materials
// Students see only materials for their category.
// Admins and teachers see all materials.
exports.list = asyncHandler(async(req, res) => {
    let where = {};

    if (req.user.role === "STUDENT") {
        const category = await studentCategory(req.user.id);

        if (!category) {
            return res.json({ materials: [] });
        }

        where = { category };
    }

    const materials = await prisma.material.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            category: true,
            originalName: true,
            fileSize: true,
            createdAt: true,
        },
    });

    res.json({ materials });
});

// GET /api/materials/:id/download
// View PDF by default; download PDF when ?download=true
exports.download = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "Invalid id",
        });
    }

    const material = await prisma.material.findUnique({
        where: { id },
    });

    if (!material) {
        return res.status(404).json({
            message: "File not found",
        });
    }

    // Students can only access materials belonging to their category
    if (req.user.role === "STUDENT") {
        const category = await studentCategory(req.user.id);

        const allowed =
            category &&
            category.toLowerCase() ===
            material.category.trim().toLowerCase();

        if (!allowed) {
            return res.status(403).json({
                message: "This file is not for your category",
            });
        }
    }

    const filePath = path.join(materialDir, material.fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "File is missing on the server",
        });
    }

    const isDownload = req.query.download === "true";

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        `${isDownload ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(material.originalName)}`
    );

    res.sendFile(filePath);
});

// DELETE /api/materials/:id
// Admin deletes a study material
exports.remove = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "Invalid id",
        });
    }

    const material = await prisma.material.findUnique({
        where: { id },
    });

    if (!material) {
        return res.status(404).json({
            message: "File not found",
        });
    }

    await prisma.material.delete({
        where: { id },
    });

    removeFile(material.fileName);

    res.json({ message: "Deleted" });
});