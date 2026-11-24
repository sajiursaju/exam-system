const router = require("express").Router();

const ctrl = require("../controllers/notices.controller");
const auth = require("../middleware/auth");

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admins only" });
    }
    next();
}

// Temporary test route
router.get("/test", (req, res) => {
    res.json({
        message: "Notice router is working!"
    });
});

// Public: Everyone can see published notices
router.get("/public", ctrl.listPublic);

// Admin: Authentication required
router.use(auth.requireAuth);
router.use(requireAdmin);

router.get("/admin", ctrl.listAdmin);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/publish", ctrl.togglePublish);
router.patch("/:id/pin", ctrl.togglePin);
router.delete("/:id", ctrl.remove);

module.exports = router;