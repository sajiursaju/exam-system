const router = require("express").Router();
const ctrl = require("../controllers/questions.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

router.use(requireAuth, requireRole("ADMIN", "TEACHER"));

router.put("/:id", ctrl.update);       // PUT    /api/questions/:id
router.delete("/:id", ctrl.remove);    // DELETE /api/questions/:id

module.exports = router;
