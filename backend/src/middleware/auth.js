// Runs before protected routes: reads the login cookie and loads the account.
const jwt = require("jsonwebtoken");
const { findById } = require("../lib/accounts");
const env = require("../config/env");

async function requireAuth(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        const payload = jwt.verify(token, env.jwtSecret);

        // Re-check the database every time, so deactivating an account works immediately.
        // The role in the token tells us which table to look in.
        const account = await findById(payload.role, payload.id);

        if (!account || account.status !== "ACTIVE") {
            return res.status(401).json({ message: "Account not active" });
        }

        req.user = {
            id: account.id,
            name: account.name,
            email: account.email,
            role: payload.role,
            status: account.status,
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired session" });
    }
}

module.exports = { requireAuth };