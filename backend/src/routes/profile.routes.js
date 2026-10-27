const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const profile = require("../controllers/profile.controller");

const router = express.Router();

// Every profile route needs a logged-in, active user
router.use(requireAuth);

// GET /api/profile/me  → load my profile
router.get("/me", profile.getMe);

// PUT /api/profile/me  → save my edits (fields depend on my role)
router.put("/me", profile.updateMe);

// POST /api/profile/me/avatar  → upload my profile image
// order matters: the upload middleware saves the file, then the controller stores its path
router.post("/me/avatar", uploadAvatar, profile.uploadAvatar);

module.exports = router;