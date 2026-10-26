const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { getOwnedExam, httpError } = require("../lib/exam-access");

const examSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().max(2000).nullish(),
    durationMinutes: z.number().int().min(1).max(600),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    totalMarks: z.number().int().min(1),
    passingMarks: z.number().int().min(0),
    shuffleQuestions: z.boolean().default(false),
    maxTabSwitches: z.number().int().min(0).max(20).default(3), // 0 = tab-switch check off
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  })
  .refine((d) => d.passingMarks <= d.totalMarks, {
    message: "passingMarks cannot exceed totalMarks",
    path: ["passingMarks"],
  });

// Adds state: UPCOMING / ONGOING / COMPLETED based on the current time.
function withState(exam) {
  const now = new Date();
  let state = "ONGOING";
  if (now < exam.startTime) state = "UPCOMING";
  else if (now > exam.endTime) state = "COMPLETED";
  return { ...exam, state };
}

// POST /api/exams
exports.create = asyncHandler(async (req, res) => {
  const data = examSchema.parse(req.body);
  const exam = await prisma.exam.create({ data: { ...data, createdBy: req.user.id } });
  res.status(201).json({ exam });
});

// GET /api/exams
exports.list = asyncHandler(async (req, res) => {
  const isStudent = req.user.role === "STUDENT";
  const where = req.user.role === "TEACHER" ? { createdBy: req.user.id } : {};

  const exams = await prisma.exam.findMany({
    where,
    orderBy: { startTime: "desc" },
    include: isStudent
      ? {
          _count: { select: { questions: true } },
          attempts: {
            where: { studentId: req.user.id },
            select: { id: true, status: true, totalScore: true },
          },
        }
      : { _count: { select: { questions: true, attempts: true } } },
  });

  res.json({ exams: exams.map(withState) });
});

// GET /api/exams/:id
exports.getOne = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({
    where: { id: Number(req.params.id) },
    include: { _count: { select: { questions: true } } },
  });
  if (!exam) throw httpError(404, "Exam not found");
  res.json({ exam: withState(exam) });
});

// PUT /api/exams/:id
exports.update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await getOwnedExam(req.user, id);
  const data = examSchema.parse(req.body);
  const exam = await prisma.exam.update({ where: { id }, data });
  res.json({ exam });
});

// DELETE /api/exams/:id
exports.remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await getOwnedExam(req.user, id);
  await prisma.exam.delete({ where: { id } });
  res.json({ message: "Exam deleted" });
});
