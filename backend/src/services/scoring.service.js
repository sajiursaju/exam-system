// All marks calculation happens HERE, on the server.
// The browser never decides a score.

const prisma = require("../lib/prisma");

// Creates a consistent HTTP error.
function scoringError(status, message) {
    const error = new Error(message);
    error.status = status;
    error.statusCode = status;
    return error;
}

// Grades ONE question.
// Returns { isCorrect, marksObtained, needsManual }.
function gradeQuestion(question, answer) {
    const selected =
        answer && typeof answer.selectedAnswer === "string" ?
        answer.selectedAnswer.trim() :
        "";

    // Short answers require manual grading.
    if (question.questionType === "SHORT_ANSWER") {
        return {
            isCorrect: null,
            marksObtained: 0,
            needsManual: selected.length > 0,
        };
    }

    // MCQ and True/False.
    if (!selected) {
        return {
            isCorrect: false,
            marksObtained: 0,
            needsManual: false,
        };
    }

    const isCorrect = selected === question.correctAnswer;

    return {
        isCorrect,
        marksObtained: isCorrect ? question.marks : 0,
        needsManual: false,
    };
}

// Finalizes an attempt.
//
// Uses an atomic conditional update so only one request can
// claim an IN_PROGRESS attempt.
//
// Safe to call multiple times: subsequent calls return the
// already-finalized attempt without calculating marks again.
async function finalizeAttempt(
    attemptId,
    finalStatus,
    endTime = new Date()
) {
    if (!["SUBMITTED", "AUTO_SUBMITTED"].includes(finalStatus)) {
        throw scoringError(400, "Invalid final attempt status");
    }

    if (!(endTime instanceof Date) || Number.isNaN(endTime.getTime())) {
        throw scoringError(400, "Invalid attempt end time");
    }

    return prisma.$transaction(
        async(tx) => {
            // Atomically claim the attempt.
            // Only one concurrent request can change IN_PROGRESS.
            const claimed = await tx.examAttempt.updateMany({
                where: {
                    id: attemptId,
                    status: "IN_PROGRESS",
                },
                data: {
                    status: finalStatus,
                    endTime,
                },
            });

            // Another request already finalized it, or it does not exist.
            if (claimed.count === 0) {
                return tx.examAttempt.findUnique({
                    where: { id: attemptId },
                });
            }

            const attempt = await tx.examAttempt.findUnique({
                where: { id: attemptId },
                include: {
                    exam: {
                        include: {
                            questions: true,
                        },
                    },
                    answers: true,
                },
            });

            if (!attempt) {
                throw scoringError(404, "Attempt not found");
            }

            const answerByQuestion = new Map(
                attempt.answers.map((answer) => [
                    answer.questionId,
                    answer,
                ])
            );

            let total = 0;

            // Calculate all marks on the server.
            for (const question of attempt.exam.questions) {
                const savedAnswer = answerByQuestion.get(question.id);
                const graded = gradeQuestion(question, savedAnswer);

                total += graded.marksObtained;

                await tx.studentAnswer.upsert({
                    where: {
                        attemptId_questionId: {
                            attemptId,
                            questionId: question.id,
                        },
                    },
                    update: {
                        isCorrect: graded.isCorrect,
                        marksObtained: graded.marksObtained,
                    },
                    create: {
                        attemptId,
                        questionId: question.id,
                        selectedAnswer: null,
                        isCorrect: graded.isCorrect,
                        marksObtained: graded.marksObtained,
                    },
                });
            }

            // Status and endTime were already claimed atomically.
            // Save the final calculated score.
            return tx.examAttempt.update({
                where: { id: attemptId },
                data: {
                    totalScore: total,
                },
            });
        }, {
            timeout: 20000,
            isolationLevel: "ReadCommitted",
        }
    );
}

// Teacher manually grades short-answer questions.
//
// grades = [{ questionId, marks }]
async function applyManualGrades(attemptId, grades) {
    if (!Array.isArray(grades) || grades.length === 0) {
        throw scoringError(400, "At least one grade is required");
    }

    return prisma.$transaction(
        async(tx) => {
            const attempt = await tx.examAttempt.findUnique({
                where: { id: attemptId },
                include: {
                    exam: {
                        include: {
                            questions: true,
                        },
                    },
                },
            });

            if (!attempt) {
                throw scoringError(404, "Attempt not found");
            }

            if (attempt.status === "IN_PROGRESS") {
                throw scoringError(
                    409,
                    "Cannot grade an attempt that is still in progress"
                );
            }

            const questionById = new Map(
                attempt.exam.questions.map((question) => [
                    question.id,
                    question,
                ])
            );

            for (const grade of grades) {
                const question = questionById.get(grade.questionId);

                if (!question ||
                    question.questionType !== "SHORT_ANSWER"
                ) {
                    throw scoringError(
                        400,
                        `Question ${grade.questionId} is not a short-answer question of this exam`
                    );
                }

                if (
                    typeof grade.marks !== "number" ||
                    !Number.isFinite(grade.marks) ||
                    grade.marks < 0 ||
                    grade.marks > question.marks
                ) {
                    throw scoringError(
                        400,
                        `Marks for question ${question.id} must be between 0 and ${question.marks}`
                    );
                }

                await tx.studentAnswer.upsert({
                    where: {
                        attemptId_questionId: {
                            attemptId,
                            questionId: question.id,
                        },
                    },
                    update: {
                        marksObtained: grade.marks,
                        isCorrect: grade.marks > 0,
                    },
                    create: {
                        attemptId,
                        questionId: question.id,
                        marksObtained: grade.marks,
                        isCorrect: grade.marks > 0,
                    },
                });
            }

            // Recalculate the complete score after manual grading.
            const allAnswers = await tx.studentAnswer.findMany({
                where: { attemptId },
                include: {
                    question: true,
                },
            });

            const total = allAnswers.reduce(
                (sum, answer) => sum + answer.marksObtained,
                0
            );

            // Only submitted short answers with no grade remain pending.
            const stillPending = allAnswers.some(
                (answer) =>
                answer.question.questionType === "SHORT_ANSWER" &&
                answer.isCorrect === null &&
                typeof answer.selectedAnswer === "string" &&
                answer.selectedAnswer.trim().length > 0
            );

            return tx.examAttempt.update({
                where: { id: attemptId },
                data: {
                    totalScore: total,
                    status: stillPending ? attempt.status : "GRADED",
                },
            });
        }, {
            timeout: 20000,
            isolationLevel: "Serializable",
        }
    );
}

module.exports = {
    gradeQuestion,
    finalizeAttempt,
    applyManualGrades,
};