const router = require("express").Router();
const ctrl = require("../controllers/attempts.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const student = requireRole("STUDENT");
const staff = requireRole("ADMIN", "TEACHER");

router.use(requireAuth);

// NOTE: fixed words like /mine and /exam/... must come BEFORE /:id
router.post("/start", student, ctrl.start);                       // POST  /api/attempts/start
router.get("/mine", student, ctrl.mine);                          // GET   /api/attempts/mine
router.get("/exam/:examId", staff, ctrl.listForExam);             // GET   /api/attempts/exam/:examId
router.get("/exam/:examId/export", staff, ctrl.exportCsv);        // GET   /api/attempts/exam/:examId/export

router.get("/:id", student, ctrl.getOne);                         // GET   /api/attempts/:id
router.put("/:id/answer", student, ctrl.saveAnswer);              // PUT   /api/attempts/:id/answer
router.post("/:id/tab-switch", student, ctrl.tabSwitch);          // POST  /api/attempts/:id/tab-switch
router.post("/:id/submit", student, ctrl.submit);                 // POST  /api/attempts/:id/submit
router.get("/:id/result", ctrl.result);                           // GET   /api/attempts/:id/result
router.patch("/:id/grade", staff, ctrl.grade);                    // PATCH /api/attempts/:id/grade

module.exports = router;
