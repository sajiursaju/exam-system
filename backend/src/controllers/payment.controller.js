const prisma = require("../lib/prisma");

const PAYMENT_AMOUNT = 99;
const DEFAULT_TRIAL_DAYS = 7;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const sendError = (res, error, fallback = "Something went wrong") => {
    console.error(error);

    return res.status(error.statusCode || 500).json({
        message: error.message || fallback,
    });
};

const getSettings = async() => {
    const settings = await prisma.paymentSetting.findMany();

    const result = {};

    for (const setting of settings) {
        result[setting.key] = setting.value;
    }

    return {
        bkash: result.bkash || "",
        nagad: result.nagad || "",
        free_trial_enabled: result.free_trial_enabled === undefined ?
            "true" :
            result.free_trial_enabled,
        free_trial_days: result.free_trial_days || String(DEFAULT_TRIAL_DAYS),
    };
};

const getTrialConfig = async() => {
    const settings = await getSettings();

    const parsedDays = Number.parseInt(settings.free_trial_days, 10);

    const days =
        Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 3650 ?
        parsedDays :
        DEFAULT_TRIAL_DAYS;

    return {
        enabled: settings.free_trial_enabled === "true",
        days,
    };
};

const getStudentTrialStatus = async(studentId) => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            trialStartedAt: true,
            trialEndsAt: true,
        },
    });

    if (!student) {
        return null;
    }

    const config = await getTrialConfig();
    const now = new Date();

    const active = !!student.trialEndsAt &&
        new Date(student.trialEndsAt).getTime() > now.getTime();

    const used = !!student.trialStartedAt;

    return {
        enabled: config.enabled,
        days: config.days,
        used,
        eligible: config.enabled && !used,
        active,
        expired: used && !active,
        trialStartedAt: student.trialStartedAt,
        trialEndsAt: student.trialEndsAt,
        remainingMilliseconds: active ?
            new Date(student.trialEndsAt).getTime() - now.getTime() :
            0,
    };
};

// --------------------------------------------------
// STUDENT: GET TRIAL STATUS
// GET /payments/trial-status
// --------------------------------------------------

exports.getTrialStatus = async(req, res) => {
    try {
        const status = await getStudentTrialStatus(req.user.id);

        if (!status) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        return res.json(status);
    } catch (error) {
        return sendError(res, error, "Could not load trial status");
    }
};

// --------------------------------------------------
// STUDENT: START FREE TRIAL
// POST /payments/start-trial
// --------------------------------------------------

exports.startFreeTrial = async(req, res) => {
    try {
        const studentId = req.user.id;
        const config = await getTrialConfig();

        if (!config.enabled) {
            return res.status(403).json({
                message: "Free trial is currently disabled",
            });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                trialStartedAt: true,
                trialEndsAt: true,
            },
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        if (student.trialStartedAt) {
            return res.status(409).json({
                message: "You have already used your free trial",
                trialEndsAt: student.trialEndsAt,
            });
        }

        const startedAt = new Date();
        const endsAt = new Date(
            startedAt.getTime() + config.days * 24 * 60 * 60 * 1000
        );

        // Atomic update prevents multiple trial activations.
        const result = await prisma.student.updateMany({
            where: {
                id: studentId,
                trialStartedAt: null,
            },
            data: {
                trialStartedAt: startedAt,
                trialEndsAt: endsAt,
            },
        });

        if (result.count !== 1) {
            return res.status(409).json({
                message: "You have already used your free trial",
            });
        }

        return res.status(200).json({
            message: `Your ${config.days}-day free trial has started`,
            trialStartedAt: startedAt,
            trialEndsAt: endsAt,
            days: config.days,
        });
    } catch (error) {
        return sendError(res, error, "Could not start free trial");
    }
};

// --------------------------------------------------
// STUDENT: SUBMIT PAYMENT
// POST /payments/submit
// --------------------------------------------------

exports.submitPayment = async(req, res) => {
    try {
        const studentId = req.user.id;

        const method = String(req.body.method || "").toLowerCase().trim();
        const transactionId = String(
            req.body.transactionId || ""
        ).trim();

        if (!["bkash", "nagad"].includes(method)) {
            return res.status(400).json({
                message: "Please select a valid payment method",
            });
        }

        if (!transactionId || transactionId.length > 100) {
            return res.status(400).json({
                message: "Please enter a valid transaction ID",
            });
        }

        const settings = await getSettings();

        if (!settings[method]) {
            return res.status(400).json({
                message: `${method} payment is not currently available`,
            });
        }

        const existingPending = await prisma.paymentRequest.findFirst({
            where: {
                studentId,
                status: "PENDING",
            },
        });

        if (existingPending) {
            return res.status(409).json({
                message: "You already have a pending payment request",
                payment: existingPending,
            });
        }

        const existingTransaction =
            await prisma.paymentRequest.findFirst({
                where: {
                    transactionId,
                },
            });

        if (existingTransaction) {
            return res.status(409).json({
                message: "This transaction ID has already been submitted",
            });
        }

        const payment = await prisma.paymentRequest.create({
            data: {
                studentId,
                method,
                transactionId,
                amount: PAYMENT_AMOUNT,
                status: "PENDING",
            },
        });

        return res.status(201).json({
            message: "Payment submitted successfully. Waiting for admin approval.",
            payment,
        });
    } catch (error) {
        return sendError(res, error, "Could not submit payment");
    }
};

// --------------------------------------------------
// STUDENT: MY PAYMENT HISTORY
// GET /payments/my-payments
// --------------------------------------------------

exports.getMyPayments = async(req, res) => {
    try {
        const payments = await prisma.paymentRequest.findMany({
            where: {
                studentId: req.user.id,
            },
            include: {
                examAccesses: {
                    include: {
                        exam: {
                            select: {
                                id: true,
                                title: true,
                                targetExam: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(payments);
    } catch (error) {
        return sendError(res, error, "Could not load payment history");
    }
};

// --------------------------------------------------
// STUDENT: MY EXAM ACCESS
// GET /payments/my-accesses
// --------------------------------------------------

exports.getMyExamAccesses = async(req, res) => {
    try {
        const accesses = await prisma.examAccess.findMany({
            where: {
                studentId: req.user.id,
            },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        targetExam: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(accesses);
    } catch (error) {
        return sendError(res, error, "Could not load exam accesses");
    }
};

// --------------------------------------------------
// ADMIN: ALL PAYMENT REQUESTS
// GET /payments/all
// --------------------------------------------------

exports.getAllPayments = async(req, res) => {
    try {
        const payments = await prisma.paymentRequest.findMany({
            include: {
                student: true,
                examAccesses: {
                    include: {
                        exam: {
                            select: {
                                id: true,
                                title: true,
                                targetExam: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(payments);
    } catch (error) {
        return sendError(res, error, "Could not load payment requests");
    }
};

// --------------------------------------------------
// ADMIN: APPROVE PAYMENT
// PUT /payments/approve/:id
// --------------------------------------------------

exports.approvePayment = async(req, res) => {
    try {
        const paymentId = Number(req.params.id);
        const examIds = req.body.examIds;

        if (!Number.isInteger(paymentId) || paymentId <= 0) {
            return res.status(400).json({
                message: "Invalid payment ID",
            });
        }

        if (!Array.isArray(examIds) ||
            examIds.length === 0 ||
            !examIds.every(
                (id) => Number.isInteger(Number(id)) && Number(id) > 0
            )
        ) {
            return res.status(400).json({
                message: "Please select at least one valid exam",
            });
        }

        const uniqueExamIds = [...new Set(examIds.map(Number))];

        const payment = await prisma.paymentRequest.findUnique({
            where: {
                id: paymentId,
            },
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment request not found",
            });
        }

        if (payment.status !== "PENDING") {
            return res.status(409).json({
                message: "This payment request has already been processed",
            });
        }

        const exams = await prisma.exam.findMany({
            where: {
                id: { in: uniqueExamIds,
                },
            },
            select: {
                id: true,
            },
        });

        if (exams.length !== uniqueExamIds.length) {
            return res.status(400).json({
                message: "One or more selected exams do not exist",
            });
        }

        await prisma.$transaction(async(tx) => {
            await tx.paymentRequest.update({
                where: {
                    id: paymentId,
                },
                data: {
                    status: "APPROVED",
                },
            });

            for (const examId of uniqueExamIds) {
                await tx.examAccess.upsert({
                    where: {
                        studentId_examId: {
                            studentId: payment.studentId,
                            examId,
                        },
                    },
                    update: {
                        paymentRequestId: paymentId,
                    },
                    create: {
                        studentId: payment.studentId,
                        examId,
                        paymentRequestId: paymentId,
                    },
                });
            }
        });

        return res.json({
            message: "Payment approved and selected exams unlocked successfully",
        });
    } catch (error) {
        return sendError(res, error, "Could not approve payment");
    }
};

// --------------------------------------------------
// ADMIN: REJECT PAYMENT
// PUT /payments/reject/:id
// --------------------------------------------------

exports.rejectPayment = async(req, res) => {
    try {
        const paymentId = Number(req.params.id);

        if (!Number.isInteger(paymentId) || paymentId <= 0) {
            return res.status(400).json({
                message: "Invalid payment ID",
            });
        }

        const payment = await prisma.paymentRequest.findUnique({
            where: {
                id: paymentId,
            },
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment request not found",
            });
        }

        if (payment.status !== "PENDING") {
            return res.status(409).json({
                message: "This payment request has already been processed",
            });
        }

        await prisma.paymentRequest.update({
            where: {
                id: paymentId,
            },
            data: {
                status: "REJECTED",
            },
        });

        return res.json({
            message: "Payment rejected successfully",
        });
    } catch (error) {
        return sendError(res, error, "Could not reject payment");
    }
};

// --------------------------------------------------
// ADMIN: PAYMENT STATISTICS
// GET /payments/stats
// --------------------------------------------------

exports.getPaymentStats = async(req, res) => {
    try {
        const [total, pending, approved, rejected, revenue] =
        await Promise.all([
            prisma.paymentRequest.count(),

            prisma.paymentRequest.count({
                where: { status: "PENDING" },
            }),

            prisma.paymentRequest.count({
                where: { status: "APPROVED" },
            }),

            prisma.paymentRequest.count({
                where: { status: "REJECTED" },
            }),

            prisma.paymentRequest.aggregate({
                where: { status: "APPROVED" },
                _sum: { amount: true },
            }),
        ]);

        return res.json({
            total,
            pending,
            approved,
            rejected,
            totalEarned: revenue._sum.amount || 0,
        });
    } catch (error) {
        return sendError(res, error, "Could not load payment statistics");
    }
};

// --------------------------------------------------
// PUBLIC: GET PAYMENT SETTINGS
// GET /payments/settings
// --------------------------------------------------

exports.getPaymentSettings = async(req, res) => {
    try {
        const settings = await getSettings();

        return res.json(settings);
    } catch (error) {
        return sendError(res, error, "Could not load payment settings");
    }
};

// --------------------------------------------------
// ADMIN: UPDATE PAYMENT SETTINGS
// PUT /payments/settings
// --------------------------------------------------

exports.updatePaymentSettings = async(req, res) => {
    try {
        const {
            bkash,
            nagad,
            free_trial_enabled,
            free_trial_days,
        } = req.body;

        const updates = [];

        if (bkash !== undefined) {
            updates.push({
                key: "bkash",
                value: String(bkash).trim(),
            });
        }

        if (nagad !== undefined) {
            updates.push({
                key: "nagad",
                value: String(nagad).trim(),
            });
        }

        if (free_trial_enabled !== undefined) {
            if (typeof free_trial_enabled !== "boolean") {
                return res.status(400).json({
                    message: "free_trial_enabled must be true or false",
                });
            }

            updates.push({
                key: "free_trial_enabled",
                value: String(free_trial_enabled),
            });
        }

        if (free_trial_days !== undefined) {
            const days = Number(free_trial_days);

            if (!Number.isInteger(days) ||
                days < 1 ||
                days > 3650
            ) {
                return res.status(400).json({
                    message: "Free trial days must be between 1 and 3650",
                });
            }

            updates.push({
                key: "free_trial_days",
                value: String(days),
            });
        }

        for (const item of updates) {
            await prisma.paymentSetting.upsert({
                where: {
                    key: item.key,
                },
                update: {
                    value: item.value,
                },
                create: {
                    key: item.key,
                    value: item.value,
                },
            });
        }

        const settings = await getSettings();

        return res.json({
            message: "Payment settings updated successfully",
            settings,
        });
    } catch (error) {
        return sendError(res, error, "Could not update payment settings");
    }
};