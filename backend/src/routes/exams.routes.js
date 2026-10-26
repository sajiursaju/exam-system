const router = require("express").Router();
const exams = require("../controllers/exams.controller");
const questions = require("../controllers/questions.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const staff = requireRole("ADMIN", "TEACHER");

router.use(requireAuth);

router.get("/", exams.list);                              // GET    /api/exams
router.get("/:id", exams.getOne);                         // GET    /api/exams/:id
router.post("/", staff, exams.create);                    // POST   /api/exams
router.put("/:id", staff, exams.update);                  // PUT    /api/exams/:id
router.delete("/:id", staff, exams.remove);               // DELETE /api/exams/:id

router.get("/:examId/questions", staff, questions.listByExam);        // GET  /api/exams/:examId/questions
router.post("/:examId/questions", staff, questions.create);           // POST /api/exams/:examId/questions
router.post("/:examId/questions/bulk", staff, questions.bulkCreate);  // POST /api/exams/:examId/questions/bulk

module.exports = router;
