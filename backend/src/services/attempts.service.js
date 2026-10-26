// Timer rules and shared helpers for exam attempts. The SERVER owns the clock.
const prisma = require("../lib/prisma");
const { httpError } = require("../lib/exam-access");
const { seededShuffle } = require("../lib/shuffle");
const { finalizeAttempt } = require("./scoring.service");

// The moment the attempt must end: start + duration, but never after the exam window closes.
function deadlineOf(attempt, exam) {
  const byDuration = attempt.startTime.getTime() + exam.durationMinutes * 60 * 1000;
  return new Date(Math.min(byDuration, exam.endTime.getTime()));
}

// Loads an attempt (with its exam and student). A student can only load their own.
async function loadAttempt(attemptId, user) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: true, student: { select: { id: true, name: true, email: true } } },
  });
  if (!attempt) throw httpError(404, "Attempt not found");
  if (user.role === "STUDENT" && attempt.studentId !== user.id) {
    throw httpError(403, "Forbidden");
  }
  return attempt;
}

// Throws if the attempt is finished or the time is over (and auto-submits if time is over).
async function ensureActive(attempt) {
  if (attempt.status !== "IN_PROGRESS") {
    throw httpError(409, "This attempt is already finished", {
      finished: true,
      status: attempt.status,
    });
  }
  const deadline = deadlineOf(attempt, attempt.exam);
  if (new Date() > deadline) {
    await finalizeAttempt(attempt.id, "AUTO_SUBMITTED", deadline);
    throw httpError(409, "Time is over. Your exam was auto-submitted.", {
      finished: true,
      status: "AUTO_SUBMITTED",
    });
  }
  return deadline;
}

// Everything the exam screen needs. Correct answers are NEVER included.
async function buildAttemptPayload(attempt, deadline) {
  const exam = attempt.exam;

  let questions = await prisma.question.findMany({
    where: { examId: exam.id },
    orderBy: { id: "asc" },
    select: { id: true, questionText: true, questionType: true, options: true, marks: true },
  });
  if (exam.shuffleQuestions) questions = seededShuffle(questions, attempt.id);

  const answers = await prisma.studentAnswer.findMany({
    where: { attemptId: attempt.id },
    select: { questionId: true, selectedAnswer: true, markedReview: true },
  });

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startTime: attempt.startTime,
      tabSwitchCount: attempt.tabSwitchCount,
    },
    exam: {
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      maxTabSwitches: exam.maxTabSwitches,
    },
    deadline: deadline.toISOString(),
    secondsLeft: Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000)),
    questions,
    answers,
  };
}

// Background job: submit attempts whose time ran out (student closed the browser, etc.).
async function autoSubmitExpired() {
  const open = await prisma.examAttempt.findMany({
    where: { status: "IN_PROGRESS" },
    include: { exam: true },
  });
  const now = new Date();
  let count = 0;
  for (const attempt of open) {
    const deadline = deadlineOf(attempt, attempt.exam);
    if (now > deadline) {
      await finalizeAttempt(attempt.id, "AUTO_SUBMITTED", deadline);
      count++;
    }
  }
  return count;
}

module.exports = { deadlineOf, loadAttempt, ensureActive, buildAttemptPayload, autoSubmitExpired };
