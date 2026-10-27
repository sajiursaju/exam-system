const fs = require("fs");
const path = require("path");
const multer = require("multer");

// backend/uploads/avatars  (app.js serves backend/uploads at /api/uploads)
const avatarDir = path.join(__dirname, "..", "..", "uploads", "avatars");
const avatarUrlPrefix = "/api/uploads/avatars/";

fs.mkdirSync(avatarDir, { recursive: true }); // create the folder if it is missing

const extByMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        // req.user is set by the login-check middleware that runs before this one
        cb(null, `user-${req.user.id}-${Date.now()}${extByMime[file.mimetype]}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) => {
        if (extByMime[file.mimetype]) return cb(null, true);
        cb(new Error("Only JPG, PNG or WebP images are allowed"));
    },
});

const single = upload.single("avatar"); // the form field must be named "avatar"

// Wrapper that turns multer errors into a normal 400 JSON response
function uploadAvatar(req, res, next) {
    single(req, res, (err) => {
        if (!err) return next();
        const message =
            err.code === "LIMIT_FILE_SIZE" ? "Image must be 2 MB or smaller" : err.message;
        res.status(400).json({ message });
    });
}

module.exports = { uploadAvatar, avatarDir, avatarUrlPrefix };