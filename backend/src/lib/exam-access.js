const prisma = require("./prisma");

// Creates an Error that the error middleware turns into a JSON reply.
function httpError(status, message, extra) {
    const e = new Error(message);
    e.status = status;
    e.statusCode = status;
    e.extra = extra;
    return e;
}

// ADMIN may access any exam.
// TEACHER may only access exams they created.
async function getOwnedExam(user, examId) {
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId,
        },
    });

    if (!exam) {
        throw httpError(404, "Exam not found");
    }

    const role = String(user.role || "").toUpperCase();

    if (role === "ADMIN") {
        return exam;
    }

    if (
        role === "TEACHER" &&
        exam.createdByTeacherId === user.id
    ) {
        return exam;
    }

    throw httpError(403, "Forbidden");
}

// Once any student has started, questions are locked
// so that exam scoring stays fair.
async function assertNoAttempts(examId) {
    const count = await prisma.examAttempt.count({
        where: {
            examId,
        },
    });

    if (count > 0) {
        throw httpError(
            409,
            "Students already started this exam; questions are locked"
        );
    }
}

module.exports = {
    httpError,
    getOwnedExam,
    assertNoAttempts,
};