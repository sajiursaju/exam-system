const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");

// Diagnostic: Check Prisma Notice model
console.log("Notice model in controller:", !!prisma.notice);

const noticeSchema = z.object({
    title: z.string().trim().min(2).max(200),
    content: z.string().trim().min(2),
    isPublished: z.boolean().optional(),
    isPinned: z.boolean().optional(),
});

// Public: Everyone can see published notices
exports.listPublic = asyncHandler(async(req, res) => {
    const notices = await prisma.notice.findMany({
        where: {
            isPublished: true,
        },
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
        ],
    });

    res.json(notices);
});

// Admin: Get all notices
exports.listAdmin = asyncHandler(async(req, res) => {
    const notices = await prisma.notice.findMany({
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
        ],
    });

    res.json(notices);
});

// Admin: Create notice
exports.create = asyncHandler(async(req, res) => {
    const parsed = noticeSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid notice information",
            errors: parsed.error.flatten(),
        });
    }

    const notice = await prisma.notice.create({
        data: {
            title: parsed.data.title,
            content: parsed.data.content,
            isPublished: parsed.data.isPublished ?? false,
            isPinned: parsed.data.isPinned ?? false,
        },
    });

    res.status(201).json({
        message: "Notice created successfully",
        notice,
    });
});

// Admin: Update notice
exports.update = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid notice ID",
        });
    }

    const parsed = noticeSchema.partial().safeParse(req.body);

    if (!parsed.success ||
        Object.keys(parsed.data || {}).length === 0
    ) {
        return res.status(400).json({
            message: "Please provide valid notice information",
            errors: parsed.success ?
                undefined : parsed.error.flatten(),
        });
    }

    const notice = await prisma.notice.update({
        where: { id },
        data: parsed.data,
    });

    res.json({
        message: "Notice updated successfully",
        notice,
    });
});

// Admin: Publish / Unpublish notice
exports.togglePublish = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid notice ID",
        });
    }

    const existing = await prisma.notice.findUnique({
        where: { id },
    });

    if (!existing) {
        return res.status(404).json({
            message: "Notice not found",
        });
    }

    const notice = await prisma.notice.update({
        where: { id },
        data: {
            isPublished: !existing.isPublished,
        },
    });

    res.json({
        message: "Notice publication status updated",
        notice,
    });
});

// Admin: Pin / Unpin notice
exports.togglePin = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid notice ID",
        });
    }

    const existing = await prisma.notice.findUnique({
        where: { id },
    });

    if (!existing) {
        return res.status(404).json({
            message: "Notice not found",
        });
    }

    const notice = await prisma.notice.update({
        where: { id },
        data: {
            isPinned: !existing.isPinned,
        },
    });

    res.json({
        message: "Notice pin status updated",
        notice,
    });
});

// Admin: Delete notice
exports.remove = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid notice ID",
        });
    }

    await prisma.notice.delete({
        where: { id },
    });

    res.json({
        message: "Notice deleted successfully",
    });
});
