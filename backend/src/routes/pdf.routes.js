// backend/src/routes/pdf.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfController = require("../controllers/pdf.controller");
const { requireAuth } = require("../middleware/auth");

// Store file in memory temporarily for parsing
const upload = multer({ storage: multer.memoryStorage() });

router.post("/parse", requireAuth, upload.single("pdf"), pdfController.parsePdf);

module.exports = router;