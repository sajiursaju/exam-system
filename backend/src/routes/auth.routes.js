const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

router.post("/register", ctrl.register);   // POST /api/auth/register
router.post("/login", ctrl.login);         // POST /api/auth/login
router.post("/logout", ctrl.logout);       // POST /api/auth/logout
router.get("/me", requireAuth, ctrl.me);   // GET  /api/auth/me

module.exports = router;
