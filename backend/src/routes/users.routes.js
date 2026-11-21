// backend/src/routes/users.routes.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth");

// All routes here require a logged-in user
router.use(requireAuth);

// GET /api/users
router.get("/", usersController.list);

// GET /api/users/download
router.get("/download", usersController.download); // <-- ADDED THIS LINE

// PATCH /api/users/:id/status
router.patch("/:id/status", usersController.setStatus);

// DELETE /api/users/:id
router.delete("/:id", usersController.remove);

module.exports = router;