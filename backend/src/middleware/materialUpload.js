// backend/src/middleware/materialUpload.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// Outside the public "uploads" folder on purpose: files here can only be
// reached through the materials controller, which checks the student's category.
const materialDir = path.join(__dirname, "..", "..", "private_uploads", "materials");
fs.mkdirSync(materialDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, materialDir),
    // Random name, so uploads never overwrite each other
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString("hex") + ".pdf"),
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const isPdf =
            file.mimetype === "application/pdf" &&
            file.originalname.toLowerCase().endsWith(".pdf");
        if (!isPdf) return cb(new Error("Only PDF files are allowed"));
        cb(null, true);
    },
});

// The form field that holds the file must be named "file".
// Wrapped so upload problems come back as a clear JSON message.
function uploadPdf(req, res, next) {
    upload.single("file")(req, res, (err) => {
        if (!err) return next();
        const message =
            err.code === "LIMIT_FILE_SIZE" ? "PDF must be 10 MB or smaller" : err.message;
        res.status(400).json({ message });
    });
}

module.exports = { uploadPdf, materialDir };