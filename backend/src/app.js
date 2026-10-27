const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true })); // allow the Next.js site + cookies
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Profile images: served at /api/uploads/<file name>.
// Under /api on purpose, so the Next.js proxy that already forwards /api/* to Express
// also carries the images. The browser sees them as coming from the same site.
app.use("/api/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Slows down password guessing on login/register
app.use(
    "/api/auth",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/admin/people", require("./routes/adminPeople.routes"));
app.use("/api/exams", require("./routes/exams.routes"));
app.use("/api/questions", require("./routes/questions.routes"));
app.use("/api/attempts", require("./routes/attempts.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;