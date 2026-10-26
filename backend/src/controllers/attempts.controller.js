const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { httpError, getOwnedExam } = require("../lib/exam-access");
const attemptsService = require("../services/attempts.service");
const { finalizeAttempt, applyManualGrades } = require("../services/scoring.service");

const { deadlineOf, loadAttempt, ensureActive, buildAttemptPayload } = attemptsService;

// ---------- STUDENT ----------

// POST /api/attempts/start   body: { "examId": 1 }
exports.start = asyncHandler(async (req, res) => {
  const { examId } = z.object({ examId: z.number().int() }).parse(req.body);

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { _count: { select: { questions: true } } },
  });
  if (!exam) throw httpError(404, "Exam not found");

  const now = new Date();
  if (now < exam.startTime) throw httpError(403, "This exam has not started yet");
  if (now > exam.endTime) throw httpError(403, "This exam has ended");
  if (exam._count.questions === 0) throw httpError(409, "This exam has no questions yet");

  let attempt = await prisma.examAttempt.findUnique({
    where: { studentId_examId: { studentId: req.user.id, examId } },
    include: { exam: true },
  });

  if (attempt) {
    // Already started: allow RESUME while still in progress, otherwise block a second try.
    if (attempt.status !== "IN_PROGRESS") {
      throw httpError(409, "You have already attempted this exam", { attemptId: attempt.id });
    }
  } else {
    attempt = await prisma.examAttempt.create({
      data: { studentId: req.user.id, examId },
      include: { exam: true },
    });
  }

  const deadline = await ensureActive(attempt);
  res.status(201).json(await buildAttemptPayload(attempt, deadline));
});

// GET /api/attempts/mine   (history of this student's attempts)
exports.mine = asyncHandler(async (req, res) => {
  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: req.user.id },
    orderBy: { startTime: "desc" },
    include: {
      exam: { select: { id: true, title: true, totalMarks: true, passingMarks: true } },
    },
  });
  res.json({ attempts });
});

// GET /api/attempts/:id   (reload the exam screen: questions + saved answers + time left)
exports.getOne = asyncHandler(async (req, res) => {
  const attempt = await loadAttempt(Number(req.params.id), req.user);
  const deadline = await ensureActive(attempt);
  res.json(await buildAttemptPayload(attempt, deadline));
});

// PUT /api/attempts/:id/answer   body: { questionId, selectedAnswer?, markedReview? }
const answerSchema = z.object({
  questionId: z.number().int(),
  selectedAnswer: z.string().max(5000).nullish(),
  markedReview: z.boolean().optional(),
});

exports.saveAnswer = asyncHandler(async (req, res) => {
  const attempt = await loadAttempt(Number(req.params.id), req.user);
  await ensureActive(attempt);
  const body = answerSchema.parse(req.body);

  const question = await prisma.question.findFirst({
    where: { id: body.questionId, examId: attempt.examId },
  });
  if (!question) throw httpError(400, "Question does not belong to this exam");

  // For MCQ / True-False, the answer must be one of the real options.
  if (body.selectedAnswer && question.questionType !== "SHORT_ANSWER") {
    const options = Array.isArray(question.options) ? question.options : [];
    if (!options.includes(body.selectedAnswer)) {
      throw httpError(400, "Selected answer is not one of the options");
    }
  }

  const data = {};
  if (body.selectedAnswer !== undefined) data.selectedAnswer = body.selectedAnswer ?? null;
  if (body.markedReview !== undefined) data.markedReview = body.markedReview;

  const saved = await prisma.studentAnswer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId: question.id } },
    update: data,
    create: { attemptId: attempt.id, questionId: question.id, ...data },
    select: { questionId: true, selectedAnswer: true, markedReview: true },
  });

  res.json({ answer: saved });
});

// POST /api/attempts/:id/tab-switch   (browser tells us the student left the tab)
exports.tabSwitch = asyncHandler(async (req, res) => {
  const attempt = await loadAttempt(Number(req.params.id), req.user);
  await ensureActive(attempt);

  const updated = await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: { tabSwitchCount: { increment: 1 } },
  });

  const max = attempt.exam.maxTabSwitches;
  if (max > 0 && updated.tabSwitchCount > max) {
    await finalizeAttempt(attempt.id, "AUTO_SUBMITTED");
    return res.json({ tabSwitchCount: updated.tabSwitchCount, max, autoSubmitted: true });
  }
  res.json({ tabSwitchCount: updated.tabSwitchCount, max, autoSubmitted: false });
});

// POST /api/attempts/:id/submit
exports.submit = asyncHandler(async (req, res) => {
  const attempt = await loadAttempt(Number(req.params.id), req.user);
  if (attempt.status !== "IN_PROGRESS") {
    throw httpError(409, "This attempt is already finished", { finished: true, status: attempt.status });
  }

  // If the clock already ran out, record it as an auto-submit at the deadline.
  const deadline = deadlineOf(attempt, attempt.exam);
  const late = new Date() > deadline;
  const done = await finalizeAttempt(
    attempt.id,
    late ? "AUTO_SUBMITTED" : "SUBMITTED",
    late ? deadline : new Date()
  );

  res.json({ attempt: { id: done.id, status: done.status, totalScore: done.totalScore } });
});

// ---------- RESULT (student owner OR staff who own the exam) ----------

// GET /api/attempts/:id/result
exports.result = asyncHandler(async (req, res) => {
  const attempt = await loadAttempt(Number(req.params.id), req.user);
  if (req.user.role !== "STUDENT") await getOwnedExam(req.user, attempt.examId);

  if (attempt.status === "IN_PROGRESS") {
    throw httpError(409, "This exam is still in progress");
  }

  const answers = await prisma.studentAnswer.findMany({
    where: { attemptId: attempt.id },
    include: { question: true },
    orderBy: { questionId: "asc" },
  });

  const pendingManual = answers.some(
    (a) => a.question.questionType === "SHORT_ANSWER" && a.isCorrect === null && a.selectedAnswer
  );

  res.json({
    attempt: {
      id: attempt.id,
      status: attempt.status,
      totalScore: attempt.totalScore,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      tabSwitchCount: attempt.tabSwitchCount,
    },
    student: attempt.student,
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
      totalMarks: attempt.exam.totalMarks,
      passingMarks: attempt.exam.passingMarks,
    },
    pendingManual,
    passed: pendingManual ? null : attempt.totalScore >= attempt.exam.passingMarks,
    answers: answers.map((a) => ({
      questionId: a.questionId,
      questionText: a.question.questionText,
      questionType: a.question.questionType,
      options: a.question.options,
      marks: a.question.marks,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question.correctAnswer,
      isCorrect: a.isCorrect,
      marksObtained: a.marksObtained,
    })),
  });
});

// ---------- STAFF (admin / teacher) ----------

// GET /api/attempts/exam/:examId   (all submissions for an exam)
exports.listForExam = asyncHandler(async (req, res) => {
  const examId = Number(req.params.examId);
  const exam = await getOwnedExam(req.user, examId);

  const attempts = await prisma.examAttempt.findMany({
    where: { examId },
    orderBy: { startTime: "desc" },
    include: { student: { select: { id: true, name: true, email: true } } },
  });

  res.json({
    exam: { id: exam.id, title: exam.title, totalMarks: exam.totalMarks, passingMarks: exam.passingMarks },
    attempts,
  });
});

// PATCH /api/attempts/:id/grade   body: { grades: [{ questionId, marks }] }
exports.grade = asyncHandler(async (req, res) => {
  const attemptId = Number(req.params.id);
  const attempt = await loadAttempt(attemptId, req.user);
  await getOwnedExam(req.user, attempt.examId);
  if (attempt.status === "IN_PROGRESS") throw httpError(409, "Attempt is still in progress");

  const { grades } = z
    .object({
      grades: z
        .array(z.object({ questionId: z.number().int(), marks: z.number().min(0) }))
        .min(1)
        .max(200),
    })
    .parse(req.body);

  const updated = await applyManualGrades(attemptId, grades);
  res.json({ attempt: { id: updated.id, status: updated.status, totalScore: updated.totalScore } });
});

// GET /api/attempts/exam/:examId/export   (CSV file for Excel)
function csvCell(value) {
  let s = value === null || value === undefined ? "" : String(value);
  // Stop spreadsheet formula injection (cells starting with = + - @)
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

exports.exportCsv = asyncHandler(async (req, res) => {
  const examId = Number(req.params.examId);
  const exam = await getOwnedExam(req.user, examId);

  const attempts = await prisma.examAttempt.findMany({
    where: { examId },
    orderBy: { totalScore: "desc" },
    include: { student: { select: { name: true, email: true } } },
  });

  const header = ["Student", "Email", "Status", "Score", "Total Marks", "Result", "Tab Switches", "Started", "Submitted"];
  const rows = attempts.map((a) => {
    let result = "PENDING";
    if (a.status !== "IN_PROGRESS" && a.status !== "SUBMITTED" && a.status !== "AUTO_SUBMITTED") {
      result = a.totalScore >= exam.passingMarks ? "PASS" : "FAIL";
    }
    return [
      a.student.name,
      a.student.email,
      a.status,
      a.totalScore,
      exam.totalMarks,
      result,
      a.tabSwitchCount,
      a.startTime.toISOString(),
      a.endTime ? a.endTime.toISOString() : "",
    ];
  });

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="exam-${examId}-results.csv"`);
  res.send("\uFEFF" + csv); // BOM so Excel shows Bangla correctly
});
