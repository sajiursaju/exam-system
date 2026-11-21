// backend/src/controllers/exams.controller.js
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { getOwnedExam, httpError } = require("../lib/exam-access");

const examSchema = z
    .object({
        title: z.string().min(3).max(200),
        // Which exam this is for, for example "Primary Teacher". Students only see exams
        // whose targetExam matches their own. Empty text is stored as null.
        targetExam: z
            .string()
            .trim()
            .max(100)
            .nullish()
            .transform((v) => v || null),
        description: z.string().max(2000).nullish(),
        durationMinutes: z.number().int().min(1).max(600),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        totalMarks: z.number().int().min(1),
        passingMarks: z.number().int().min(0),
        shuffleQuestions: z.boolean().default(false),
        maxTabSwitches: z.number().int().min(0).max(20).default(3),
    })
    .refine((d) => d.endTime > d.startTime, {
        message: "endTime must be after startTime",
        path: ["endTime"],
    })
    .refine((d) => d.passingMarks <= d.totalMarks, {
        message: "passingMarks cannot exceed totalMarks",
        path: ["passingMarks"],
    });

function withState(exam) {
    const now = new Date();
    let state = "ONGOING";
    if (now < exam.startTime) state = "UPCOMING";
    else if (now > exam.endTime) state = "COMPLETED";
    return {...exam, state };
}

function creatorField(user) {
    if (user.role === "ADMIN") return { createdByAdminId: user.id };
    if (user.role === "TEACHER") return { createdByTeacherId: user.id };
    return {};
}

// Who can see which exams:
//   TEACHER: only the exams they created
//   STUDENT: only exams whose targetExam matches the student's targetExam
//   ADMIN:   every exam
async function creatorWhere(user) {
    if (user.role === "TEACHER") {
        return { createdByTeacherId: user.id };
    }

    if (user.role === "STUDENT") {
        const student = await prisma.student.findUnique({
            where: { id: user.id },
            select: { targetExam: true },
        });

        // The student has not chosen an exam type yet: show nothing.
        if (!student || !student.targetExam) {
            return { id: -1 };
        }

        return { targetExam: student.targetExam };
    }

    return {};
}

// POST /api/exams
exports.create = asyncHandler(async(req, res) => {
    const data = examSchema.parse(req.body);
    const exam = await prisma.exam.create({
        data: {
            ...data,
            ...creatorField(req.user),
        },
    });
    res.status(201).json({ exam });
});

// GET /api/exams
exports.list = asyncHandler(async(req, res) => {
    const isStudent = req.user.role === "STUDENT";
    const where = await creatorWhere(req.user);

    const exams = await prisma.exam.findMany({
        where,
        orderBy: { startTime: "desc" },
        include: isStudent ?
            {
                _count: { select: { questions: true } },
                attempts: {
                    where: { studentId: req.user.id },
                    select: { id: true, status: true, totalScore: true },
                },
            } :
            { _count: { select: { questions: true, attempts: true } } },
    });

    res.json({ exams: exams.map(withState) });
});

// GET /api/exams/:id
exports.getOne = asyncHandler(async(req, res) => {
    const exam = await prisma.exam.findUnique({
        where: { id: Number(req.params.id) },
        include: { _count: { select: { questions: true } } },
    });
    if (!exam) throw httpError(404, "Exam not found");
    res.json({ exam: withState(exam) });
});

// PUT /api/exams/:id
exports.update = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);
    await getOwnedExam(req.user, id);
    const data = examSchema.parse(req.body);
    const exam = await prisma.exam.update({ where: { id }, data });
    res.json({ exam });
});

// DELETE /api/exams/:id
exports.remove = asyncHandler(async(req, res) => {
    const id = Number(req.params.id);
    await getOwnedExam(req.user, id);
    await prisma.exam.delete({ where: { id } });
    res.json({ message: "Exam deleted" });
});