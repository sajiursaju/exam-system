const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { httpError, getOwnedExam } = require("../lib/exam-access");

const attemptsService = require("../services/attempts.service");

const {
    finalizeAttempt,
    applyManualGrades,
} = require("../services/scoring.service");

const {
    deadlineOf,
    loadAttempt,
    ensureActive,
    buildAttemptPayload,
} = attemptsService;

const GRACE_MS = 10 * 1000;

// ---------- STUDENT ----------

// POST /api/attempts/start
// body: { "examId": 1 }
exports.start = asyncHandler(async(req, res) => {
    const { examId } = z.object({
        examId: z.number().int().positive(),
    }).parse(req.body);

    const studentId = req.user.id;
    const now = new Date();

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
            _count: {
                select: { questions: true },
            },
        },
    });

    if (!exam) {
        throw httpError(404, "Exam not found");
    }

    if (now < exam.startTime) {
        throw httpError(403, "This exam has not started yet");
    }

    if (now > exam.endTime) {
        throw httpError(403, "This exam has ended");
    }

    if (exam._count.questions === 0) {
        throw httpError(409, "This exam has no questions yet");
    }

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            targetExam: true,
            trialStartedAt: true,
            trialEndsAt: true,
        },
    });

    if (!student) {
        throw httpError(404, "Student not found");
    }

    // Students can only access exams in their selected category.
    if (!student.targetExam || exam.targetExam !== student.targetExam) {
        throw httpError(
            403,
            "This exam does not belong to your selected category"
        );
    }

    let attempt = await prisma.examAttempt.findUnique({
        where: {
            studentId_examId: {
                studentId,
                examId,
            },
        },
        include: { exam: true },
    });

    if (attempt) {
        // An existing attempt can be resumed even if the trial has expired.
        if (attempt.status !== "IN_PROGRESS") {
            throw httpError(
                409,
                "You have already attempted this exam", { attemptId: attempt.id }
            );
        }
    } else {
        // Check free trial or approved individual exam access.
        const trialActive = !!student.trialEndsAt &&
            new Date(student.trialEndsAt).getTime() > now.getTime();

        let hasPaidAccess = false;

        if (!trialActive) {
            const access = await prisma.examAccess.findUnique({
                where: {
                    studentId_examId: {
                        studentId,
                        examId,
                    },
                },
                select: { id: true },
            });

            hasPaidAccess = !!access;
        }

        if (!trialActive && !hasPaidAccess) {
            throw httpError(
                403,
                "You need an active free trial or approved payment to access this exam", {
                    code: "PAYMENT_REQUIRED",
                    trialExpired: !!student.trialStartedAt,
                    paymentUrl: "/payment",
                }
            );
        }

        // Protect against simultaneous start requests.
        try {
            attempt = await prisma.examAttempt.create({
                data: {
                    studentId,
                    examId,
                },
                include: { exam: true },
            });
        } catch (error) {
            if (error.code !== "P2002") {
                throw error;
            }

            // Another request may have created the attempt first.
            attempt = await prisma.examAttempt.findUnique({
                where: {
                    studentId_examId: {
                        studentId,
                        examId,
                    },
                },
                include: { exam: true },
            });

            if (!attempt) {
                throw error;
            }

            if (attempt.status !== "IN_PROGRESS") {
                throw httpError(
                    409,
                    "You have already attempted this exam", { attemptId: attempt.id }
                );
            }
        }
    }

    const deadline = await ensureActive(attempt);

    res.status(200).json(
        await buildAttemptPayload(attempt, deadline)
    );
});

// GET /api/attempts/mine
exports.mine = asyncHandler(async(req, res) => {
    const attempts = await prisma.examAttempt.findMany({
        where: {
            studentId: req.user.id,
        },
        orderBy: {
            startTime: "desc",
        },
        include: {
            exam: {
                select: {
                    id: true,
                    title: true,
                    totalMarks: true,
                    passingMarks: true,
                },
            },
        },
    });

    res.json({ attempts });
});

// GET /api/attempts/:id
exports.getOne = asyncHandler(async(req, res) => {
    const attempt = await loadAttempt(
        Number(req.params.id),
        req.user
    );

    const deadline = await ensureActive(attempt);

    res.json(
        await buildAttemptPayload(attempt, deadline)
    );
});

// ---------- ANSWER SAVING ----------

const answerSchema = z.object({
    questionId: z.number().int().positive(),
    selectedAnswer: z.string().max(5000).nullish(),
    markedReview: z.boolean().optional(),
});

// PUT /api/attempts/:id/answer
exports.saveAnswer = asyncHandler(async(req, res) => {
    const attempt = await loadAttempt(
        Number(req.params.id),
        req.user
    );

    await ensureActive(attempt);

    const body = answerSchema.parse(req.body);

    const question = await prisma.question.findFirst({
        where: {
            id: body.questionId,
            examId: attempt.examId,
        },
    });

    if (!question) {
        throw httpError(
            400,
            "Question does not belong to this exam"
        );
    }

    if (
        body.selectedAnswer &&
        question.questionType !== "SHORT_ANSWER"
    ) {
        const options = Array.isArray(question.options) ?
            question.options : [];

        if (!options.includes(body.selectedAnswer)) {
            throw httpError(
                400,
                "Selected answer is not one of the options"
            );
        }
    }

    const data = {};

    if (body.selectedAnswer !== undefined) {
        data.selectedAnswer = body.selectedAnswer ?? null;
    }

    if (body.markedReview !== undefined) {
        data.markedReview = body.markedReview;
    }

    const saved = await prisma.studentAnswer.upsert({
        where: {
            attemptId_questionId: {
                attemptId: attempt.id,
                questionId: question.id,
            },
        },
        update: data,
        create: {
            attemptId: attempt.id,
            questionId: question.id,
            ...data,
        },
        select: {
            questionId: true,
            selectedAnswer: true,
            markedReview: true,
        },
    });

    res.json({ answer: saved });
});

// ---------- TAB SWITCH ----------

// POST /api/attempts/:id/tab-switch
exports.tabSwitch = asyncHandler(async(req, res) => {
    const attempt = await loadAttempt(
        Number(req.params.id),
        req.user
    );

    await ensureActive(attempt);

    // Only increment while the attempt is still in progress.
    const changed = await prisma.examAttempt.updateMany({
        where: {
            id: attempt.id,
            status: "IN_PROGRESS",
        },
        data: {
            tabSwitchCount: {
                increment: 1,
            },
        },
    });

    if (changed.count !== 1) {
        throw httpError(
            409,
            "This attempt is already finished"
        );
    }

    const updated = await prisma.examAttempt.findUnique({
        where: { id: attempt.id },
        select: {
            tabSwitchCount: true,
        },
    });

    const max = attempt.exam.maxTabSwitches;

    if (max > 0 && updated.tabSwitchCount > max) {
        const done = await finalizeAttempt(
            attempt.id,
            "AUTO_SUBMITTED"
        );

        return res.json({
            tabSwitchCount: updated.tabSwitchCount,
            max,
            autoSubmitted: true,
            status: done.status,
        });
    }

    res.json({
        tabSwitchCount: updated.tabSwitchCount,
        max,
        autoSubmitted: false,
    });
});

// ---------- SUBMIT EXAM ----------

// POST /api/attempts/:id/submit
exports.submit = asyncHandler(async(req, res) => {
    const attempt = await loadAttempt(
        Number(req.params.id),
        req.user
    );

    if (attempt.status !== "IN_PROGRESS") {
        throw httpError(
            409,
            "This attempt is already finished", {
                finished: true,
                status: attempt.status,
            }
        );
    }

    const deadline = deadlineOf(
        attempt,
        attempt.exam
    );

    const now = new Date();
    const late = now > deadline;

    // If submitted after the deadline, record it as auto-submitted.
    // The service allows a short grace period for delayed requests.
    const done = await finalizeAttempt(
        attempt.id,
        late ? "AUTO_SUBMITTED" : "SUBMITTED",
        late ? deadline : now
    );

    if (!done) {
        throw httpError(404, "Attempt not found");
    }

    res.json({
        attempt: {
            id: done.id,
            status: done.status,
            totalScore: done.totalScore,
        },
    });
});

// ---------- RESULT ----------

// GET /api/attempts/:id/result
exports.result = asyncHandler(async(req, res) => {
    const attempt = await loadAttempt(
        Number(req.params.id),
        req.user
    );

    const role = String(req.user.role || "").toUpperCase();

    if (role !== "STUDENT") {
        await getOwnedExam(
            req.user,
            attempt.examId
        );
    }

    if (attempt.status === "IN_PROGRESS") {
        throw httpError(
            409,
            "This exam is still in progress"
        );
    }

    const answers = await prisma.studentAnswer.findMany({
        where: {
            attemptId: attempt.id,
        },
        include: {
            question: true,
        },
        orderBy: {
            questionId: "asc",
        },
    });

    const pendingManual = answers.some(
        (answer) =>
        answer.question.questionType === "SHORT_ANSWER" &&
        answer.isCorrect === null &&
        !!answer.selectedAnswer
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

        passed: pendingManual ?
            null : attempt.totalScore >= attempt.exam.passingMarks,

        answers: answers.map((answer) => ({
            questionId: answer.questionId,
            questionText: answer.question.questionText,
            questionType: answer.question.questionType,
            options: answer.question.options,
            marks: answer.question.marks,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: answer.question.correctAnswer,
            isCorrect: answer.isCorrect,
            marksObtained: answer.marksObtained,
        })),
    });
});

// ---------- STAFF: ADMIN / TEACHER ----------

// GET /api/attempts/exam/:examId
exports.listForExam = asyncHandler(async(req, res) => {
    const examId = Number(req.params.examId);

    const exam = await getOwnedExam(
        req.user,
        examId
    );

    const attempts = await prisma.examAttempt.findMany({
        where: { examId },
        orderBy: {
            startTime: "desc",
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    res.json({
        exam: {
            id: exam.id,
            title: exam.title,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
        },
        attempts,
    });
});

// PATCH /api/attempts/:id/grade
exports.grade = asyncHandler(async(req, res) => {
    const attemptId = Number(req.params.id);

    const attempt = await loadAttempt(
        attemptId,
        req.user
    );

    await getOwnedExam(
        req.user,
        attempt.examId
    );

    if (attempt.status === "IN_PROGRESS") {
        throw httpError(
            409,
            "Attempt is still in progress"
        );
    }

    const { grades } = z.object({
        grades: z.array(
            z.object({
                questionId: z.number().int().positive(),
                marks: z.number().finite().min(0),
            })
        ).min(1).max(200),
    }).parse(req.body);

    const updated = await applyManualGrades(
        attemptId,
        grades
    );

    res.json({
        attempt: {
            id: updated.id,
            status: updated.status,
            totalScore: updated.totalScore,
        },
    });
});

// ---------- CSV EXPORT ----------

function csvCell(value) {
    let s =
        value === null || value === undefined ?
        "" :
        String(value);

    // Prevent spreadsheet formula injection.
    if (/^[=+\-@]/.test(s)) {
        s = "'" + s;
    }

    return `"${s.replace(/"/g, '""')}"`;
}

// GET /api/attempts/exam/:examId/export
exports.exportCsv = asyncHandler(async(req, res) => {
    const examId = Number(req.params.examId);

    const exam = await getOwnedExam(
        req.user,
        examId
    );

    const attempts = await prisma.examAttempt.findMany({
        where: { examId },
        orderBy: {
            totalScore: "desc",
        },
        include: {
            student: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    const header = [
        "Student",
        "Email",
        "Status",
        "Score",
        "Total Marks",
        "Result",
        "Tab Switches",
        "Started",
        "Submitted",
    ];

    const rows = attempts.map((attempt) => {
        let result = "PENDING";

        if (
            attempt.status === "GRADED"
        ) {
            result =
                attempt.totalScore >= exam.passingMarks ?
                "PASS" :
                "FAIL";
        }

        return [
            attempt.student.name,
            attempt.student.email,
            attempt.status,
            attempt.totalScore,
            exam.totalMarks,
            result,
            attempt.tabSwitchCount,
            attempt.startTime.toISOString(),
            attempt.endTime ?
            attempt.endTime.toISOString() :
            "",
        ];
    });

    const csv = [header, ...rows]
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n");

    res.setHeader(
        "Content-Type",
        "text/csv; charset=utf-8"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="exam-${examId}-results.csv"`
    );

    // BOM helps Excel display Bangla correctly.
    res.send("\uFEFF" + csv);
});
