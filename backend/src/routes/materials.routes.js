// backend/src/routes/materials.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/materials.controller");
const { requireAuth } = require("../middleware/auth");
const { uploadPdf } = require("../middleware/materialUpload");

function requireAdmin(req, res, next) {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admins only" });
    next();
}

router.use(requireAuth); // every route below needs a login

router.get("/", ctrl.list); // GET    /api/materials
router.get("/:id/download", ctrl.download); // GET    /api/materials/:id/download
router.post("/", requireAdmin, uploadPdf, ctrl.create); // POST   /api/materials
router.delete("/:id", requireAdmin, ctrl.remove); // DELETE /api/materials/:id

module.exports = router;