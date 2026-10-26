const { ZodError } = require("zod");

function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  // Input validation errors (wrong or missing fields)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  // Prisma: unique value already exists (for example duplicate email)
  if (err.code === "P2002") {
    return res.status(409).json({ message: "Already exists" });
  }
  // Prisma: record to update/delete was not found
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Not found" });
  }
  // Errors we threw ourselves with httpError()
  if (err.status) {
    return res.status(err.status).json({ message: err.message, ...(err.extra || {}) });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
}

module.exports = { notFound, errorHandler };
