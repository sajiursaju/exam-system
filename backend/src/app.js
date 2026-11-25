const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:3000",
    "https://mrexammentormainul.com",
    "https://www.mrexammentormainul.com",
];

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(
                new Error(`CORS blocked this origin: ${origin}`)
            );
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Profile images
app.use(
    "/api/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
);

// Login/register rate limiting
app.use(
    "/api/auth",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/admin/people", require("./routes/adminPeople.routes"));
app.use("/api/exams", require("./routes/exams.routes"));
app.use("/api/questions", require("./routes/questions.routes"));
app.use("/api/attempts", require("./routes/attempts.routes"));
app.use("/api/pdf", require("./routes/pdf.routes"));
app.use("/api/materials", require("./routes/materials.routes"));
app.use("/api/notices", require("./routes/notices.routes"));
app.use("/api/payments", require("./routes/payment.routes")); // ← NEW

// Temporary notice test endpoint
app.get("/api/notice-test", (req, res) => {
    res.json({
        message: "Notice endpoint is registered",
        timestamp: new Date().toISOString(),
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;