const express = require("express");
const { requireAuth } = require("../middleware/auth");
const people = require("../controllers/adminPeople.controller");

const router = express.Router();

// Only admin-only actions use this one
function adminOnly(req, res, next) {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admins only" });
    }
    next();
}

// 1) must be logged in and active
router.use(requireAuth);

// 2) must be an admin or a teacher (students are blocked from everything here)
router.use((req, res, next) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "TEACHER") {
        return res.status(403).json({ message: "Not allowed" });
    }
    next();
});

// GET /api/admin/people/counts   → numbers for the dashboard buttons
router.get("/counts", people.counts);

// GET /api/admin/people?role=STUDENT   → list (teachers: students only)
router.get("/", people.list);

// PATCH /api/admin/people/:id/status   → approve / activate / deactivate (admin only)
router.patch("/:id/status", adminOnly, people.setStatus);

module.exports = router;