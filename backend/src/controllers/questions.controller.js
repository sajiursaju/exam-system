const { z } = require("zod");
const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { getOwnedExam, assertNoAttempts, httpError } = require("../lib/exam-access");

const questionSchema = z
  .object({
    questionText: z.string().min(1),
    questionType: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]),
    options: z.array(z.string().min(1)).min(2).max(6).optional(),
    correctAnswer: z.string().nullish(),
    marks: z.number().int().min(1).default(1),
  })
  .superRefine((q, ctx) => {
    if (q.questionType === "MCQ") {
      if (!q.options) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "MCQ needs options" });
      } else if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "correctAnswer must match one of the options",
        });
      }
    }
    if (q.questionType === "TRUE_FALSE" && !["True", "False"].includes(q.correctAnswer)) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: 'correctAnswer must be "True" or "False"',
      });
    }
  });

// Turns validated input into the shape stored in the database.
function toDbData(q) {
  let options = Prisma.JsonNull;
  if (q.questionType === "MCQ") options = q.options;
  if (q.questionType === "TRUE_FALSE") options = ["True", "False"];
  return {
    questionText: q.questionText,
    questionType: q.questionType,
    options,
    correctAnswer: q.correctAnswer ?? null,
    marks: q.marks,
  };
}

// GET /api/exams/:examId/questions   (staff only, includes correct answers)
exports.listByExam = asyncHandler(async (req, res) => {
  const examId = Number(req.params.examId);
  await getOwnedExam(req.user, examId);
  const questions = await prisma.question.findMany({ where: { examId }, orderBy: { id: "asc" } });
  res.json({ questions });
});

// POST /api/exams/:examId/questions
exports.create = asyncHandler(async (req, res) => {
  const examId = Number(req.params.examId);
  await getOwnedExam(req.user, examId);
  await assertNoAttempts(examId);
  const q = questionSchema.parse(req.body);
  const question = await prisma.question.create({ data: { examId, ...toDbData(q) } });
  res.status(201).json({ question });
});

// POST /api/exams/:examId/questions/bulk   body: { "questions": [ ... ] }
exports.bulkCreate = asyncHandler(async (req, res) => {
  const examId = Number(req.params.examId);
  await getOwnedExam(req.user, examId);
  await assertNoAttempts(examId);
  const { questions } = z
    .object({ questions: z.array(questionSchema).min(1).max(200) })
    .parse(req.body);
  const result = await prisma.question.createMany({
    data: questions.map((q) => ({ examId, ...toDbData(q) })),
  });
  res.status(201).json({ created: result.count });
});

// PUT /api/questions/:id
exports.update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Question not found");
  await getOwnedExam(req.user, existing.examId);
  await assertNoAttempts(existing.examId);
  const q = questionSchema.parse(req.body);
  const question = await prisma.question.update({ where: { id }, data: toDbData(q) });
  res.json({ question });
});

// DELETE /api/questions/:id
exports.remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Question not found");
  await getOwnedExam(req.user, existing.examId);
  await assertNoAttempts(existing.examId);
  await prisma.question.delete({ where: { id } });
  res.json({ message: "Question deleted" });
});
