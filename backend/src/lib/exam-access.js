// Shared rules about who may touch which exam.
const prisma = require("./prisma");

// Creates an Error that the error middleware turns into a JSON reply.
// `extra` lets us add fields (for example { finished: true }) to the reply.
function httpError(status, message, extra) {
  const e = new Error(message);
  e.status = status;
  e.extra = extra;
  return e;
}

// ADMIN may use any exam. A TEACHER may only use exams they created.
async function getOwnedExam(user, examId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw httpError(404, "Exam not found");
  if (user.role === "TEACHER" && exam.createdBy !== user.id) {
    throw httpError(403, "Forbidden");
  }
  return exam;
}

// Once any student has started, questions are locked so scoring stays fair.
async function assertNoAttempts(examId) {
  const count = await prisma.examAttempt.count({ where: { examId } });
  if (count > 0) {
    throw httpError(409, "Students already started this exam; questions are locked");
  }
}

module.exports = { httpError, getOwnedExam, assertNoAttempts };
