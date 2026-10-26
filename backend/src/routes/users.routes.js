const router = require("express").Router();
const ctrl = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

router.use(requireAuth, requireRole("ADMIN"));

router.get("/", ctrl.list);                    // GET   /api/users
router.patch("/:id/status", ctrl.setStatus);   // PATCH /api/users/:id/status

module.exports = router;
