// backend/src/services/attempts.service.js
// Timer rules and shared helpers for exam attempts.
// The SERVER owns the clock.

const prisma = require("../lib/prisma");
const { httpError } = require("../lib/exam-access");
const { seededShuffle } = require("../lib/shuffle");
const { finalizeAttempt } = require("./scoring.service");

const GRACE_MS = 10000;

// The attempt deadline is start + duration,
// but never later than the exam window closing.
function deadlineOf(attempt, exam) {
    const byDuration =
        attempt.startTime.getTime() +
        exam.durationMinutes * 60 * 1000;

    return new Date(
        Math.min(byDuration, exam.endTime.getTime())
    );
}

// Loads an attempt with its exam and safe student information.
// Students can only load their own attempts.
async function loadAttempt(attemptId, user) {
    if (!Number.isInteger(attemptId) || attemptId <= 0) {
        throw httpError(400, "Invalid attempt ID");
    }

    const attempt = await prisma.examAttempt.findUnique({
        where: {
            id: attemptId,
        },
        include: {
            exam: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!attempt) {
        throw httpError(404, "Attempt not found");
    }

    const role = String(user.role || "").toUpperCase();

    if (
        role === "STUDENT" &&
        attempt.studentId !== user.id
    ) {
        throw httpError(403, "Forbidden");
    }

    return attempt;
}

// Checks whether an attempt is still active.
// The 10-second grace period is consistently used by the
// API and background auto-submit job.
async function ensureActive(attempt) {
    if (attempt.status !== "IN_PROGRESS") {
        throw httpError(
            409,
            "This attempt is already finished", {
                finished: true,
                status: attempt.status,
            }
        );
    }

    const deadline = deadlineOf(attempt, attempt.exam);
    const finalDeadline = deadline.getTime() + GRACE_MS;

    if (Date.now() > finalDeadline) {
        await finalizeAttempt(
            attempt.id,
            "AUTO_SUBMITTED",
            deadline
        );

        throw httpError(
            409,
            "Time is over. Your exam was auto-submitted.", {
                finished: true,
                status: "AUTO_SUBMITTED",
            }
        );
    }

    return deadline;
}

// Builds the exam screen payload.
// Correct answers are NEVER included.
async function buildAttemptPayload(attempt, deadline) {
    const exam = attempt.exam;

    let questions = await prisma.question.findMany({
        where: {
            examId: exam.id,
        },
        orderBy: {
            id: "asc",
        },
        select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            marks: true,
        },
    });

    if (exam.shuffleQuestions) {
        questions = seededShuffle(
            questions,
            attempt.id
        );
    }

    const answers = await prisma.studentAnswer.findMany({
        where: {
            attemptId: attempt.id,
        },
        select: {
            questionId: true,
            selectedAnswer: true,
            markedReview: true,
        },
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

        secondsLeft: Math.max(
            0,
            Math.floor(
                (deadline.getTime() - Date.now()) / 1000
            )
        ),

        questions,
        answers,
    };
}

// Background job:
// Automatically submits expired attempts even if students
// close their browsers.
//
// Uses the same 10-second grace period as ensureActive().
async function autoSubmitExpired() {
    const openAttempts = await prisma.examAttempt.findMany({
        where: {
            status: "IN_PROGRESS",
        },
        include: {
            exam: true,
        },
    });

    const now = Date.now();
    let count = 0;

    for (const attempt of openAttempts) {
        const deadline = deadlineOf(
            attempt,
            attempt.exam
        );

        const finalDeadline =
            deadline.getTime() + GRACE_MS;

        if (now > finalDeadline) {
            await finalizeAttempt(
                attempt.id,
                "AUTO_SUBMITTED",
                deadline
            );

            count++;
        }
    }

    return count;
}

module.exports = {
    deadlineOf,
    loadAttempt,
    ensureActive,
    buildAttemptPayload,
    autoSubmitExpired,
};