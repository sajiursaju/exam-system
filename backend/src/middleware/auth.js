// Runs before protected routes: reads the login cookie and loads the user.
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const env = require("../config/env");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, env.jwtSecret);

    // Re-check the database every time, so deactivating a user works immediately.
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ message: "Account not active" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = { requireAuth };
