const express = require("express");
const { requireAuth } = require("../middleware/auth");

const {
    submitPayment,
    getMyPayments,
    getMyExamAccesses,
    getTrialStatus,
    startFreeTrial,
    getAllPayments,
    approvePayment,
    rejectPayment,
    getPaymentStats,
    getPaymentSettings,
    updatePaymentSettings,
} = require("../controllers/payment.controller");

const router = express.Router();

// Student role check
const requireStudent = (req, res, next) => {
    const role = String(
        (req.user && req.user.role) || ""
    ).toUpperCase();

    if (role !== "STUDENT") {
        return res.status(403).json({
            message: "Students only",
        });
    }

    next();
};

// Admin role check
const requireAdmin = (req, res, next) => {
    const role = String(
        (req.user && req.user.role) || ""
    ).toUpperCase();

    if (role !== "ADMIN") {
        return res.status(403).json({
            message: "Admins only",
        });
    }

    next();
};

// Public payment settings
router.get("/settings", getPaymentSettings);

// Student payment routes
router.post("/submit", requireAuth, requireStudent, submitPayment);
router.get("/my-payments", requireAuth, requireStudent, getMyPayments);
router.get("/my-accesses", requireAuth, requireStudent, getMyExamAccesses);

// Free trial routes
router.get("/trial-status", requireAuth, requireStudent, getTrialStatus);
router.post("/start-trial", requireAuth, requireStudent, startFreeTrial);

// Admin routes
router.get("/all", requireAuth, requireAdmin, getAllPayments);
router.put("/approve/:id", requireAuth, requireAdmin, approvePayment);
router.put("/reject/:id", requireAuth, requireAdmin, rejectPayment);
router.get("/stats", requireAuth, requireAdmin, getPaymentStats);
router.put("/settings", requireAuth, requireAdmin, updatePaymentSettings);

module.exports = router;