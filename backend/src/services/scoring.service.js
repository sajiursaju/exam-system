// All marks calculation happens HERE, on the server. The browser never decides a score.
const prisma = require("../lib/prisma");

// Grades ONE question. Returns { isCorrect, marksObtained, needsManual }.
function gradeQuestion(question, answer) {
  const selected = (answer && answer.selectedAnswer ? answer.selectedAnswer : "").trim();

  // Short answers cannot be auto-graded: a teacher marks them later.
  if (question.questionType === "SHORT_ANSWER") {
    return { isCorrect: null, marksObtained: 0, needsManual: selected.length > 0 };
  }

  // MCQ and True/False: exact match with the stored correct answer.
  if (!selected) return { isCorrect: false, marksObtained: 0, needsManual: false };
  const isCorrect = selected === question.correctAnswer;
  return { isCorrect, marksObtained: isCorrect ? question.marks : 0, needsManual: false };
}

// Closes an attempt: grades every question, saves the total, sets the final status.
// Safe to call twice: if the attempt is already finished it just returns it.
async function finalizeAttempt(attemptId, finalStatus, endTime = new Date()) {
  return prisma.$transaction(
    async (tx) => {
      const attempt = await tx.examAttempt.findUnique({
        where: { id: attemptId },
        include: { exam: { include: { questions: true } }, answers: true },
      });
      if (!attempt || attempt.status !== "IN_PROGRESS") return attempt;

      const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
      let total = 0;

      for (const question of attempt.exam.questions) {
        const saved = answerByQuestion.get(question.id);
        const graded = gradeQuestion(question, saved);
        total += graded.marksObtained;

        await tx.studentAnswer.upsert({
          where: { attemptId_questionId: { attemptId, questionId: question.id } },
          update: { isCorrect: graded.isCorrect, marksObtained: graded.marksObtained },
          create: {
            attemptId,
            questionId: question.id,
            selectedAnswer: null,
            isCorrect: graded.isCorrect,
            marksObtained: graded.marksObtained,
          },
        });
      }

      return tx.examAttempt.update({
        where: { id: attemptId },
        data: { status: finalStatus, totalScore: total, endTime },
      });
    },
    { timeout: 20000 }
  );
}

// Teacher gives marks to short answers. Then the total is recalculated.
// grades = [{ questionId, marks }]
async function applyManualGrades(attemptId, grades) {
  return prisma.$transaction(
    async (tx) => {
      const attempt = await tx.examAttempt.findUnique({
        where: { id: attemptId },
        include: { exam: { include: { questions: true } } },
      });
      const questionById = new Map(attempt.exam.questions.map((q) => [q.id, q]));

      for (const g of grades) {
        const q = questionById.get(g.questionId);
        if (!q || q.questionType !== "SHORT_ANSWER") {
          const e = new Error(`Question ${g.questionId} is not a short-answer question of this exam`);
          e.status = 400;
          throw e;
        }
        if (g.marks < 0 || g.marks > q.marks) {
          const e = new Error(`Marks for question ${q.id} must be between 0 and ${q.marks}`);
          e.status = 400;
          throw e;
        }
        await tx.studentAnswer.upsert({
          where: { attemptId_questionId: { attemptId, questionId: q.id } },
          update: { marksObtained: g.marks, isCorrect: g.marks > 0 },
          create: { attemptId, questionId: q.id, marksObtained: g.marks, isCorrect: g.marks > 0 },
        });
      }

      const all = await tx.studentAnswer.findMany({
        where: { attemptId },
        include: { question: true },
      });
      const total = all.reduce((sum, a) => sum + a.marksObtained, 0);
      const stillPending = all.some(
        (a) => a.question.questionType === "SHORT_ANSWER" && a.isCorrect === null && a.selectedAnswer
      );

      return tx.examAttempt.update({
        where: { id: attemptId },
        data: { totalScore: total, status: stillPending ? attempt.status : "GRADED" },
      });
    },
    { timeout: 20000 }
  );
}

module.exports = { gradeQuestion, finalizeAttempt, applyManualGrades };
