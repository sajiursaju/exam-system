const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const asyncHandler = require("../lib/asyncHandler");
const { tables, findByEmail, findById } = require("../lib/accounts");
const env = require("../config/env");

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(150),
    password: z.string().min(8).max(72),
    role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"), // ADMIN can never self-register
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const cookieOptions = {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    secure: env.isProd,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
};

// Same options without maxAge, used only when clearing the cookie
const { maxAge, ...clearCookieOptions } = cookieOptions;

// POST /api/auth/register
exports.register = asyncHandler(async(req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();

    // The email must be unique across admins, teachers and students,
    // otherwise login could not tell which account it belongs to.
    if (await findByEmail(email)) {
        return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Teacher goes into the teachers table, student into the students table
    await tables[data.role].create({
        data: {
            name: data.name,
            email,
            passwordHash,
            status: "PENDING", // an admin must approve first
        },
    });

    res.status(201).json({ message: "Registered. Wait for admin approval." });
});

// POST /api/auth/login
exports.login = asyncHandler(async(req, res) => {
    const data = loginSchema.parse(req.body);
    const found = await findByEmail(data.email.toLowerCase());

    const ok = found && (await bcrypt.compare(data.password, found.account.passwordHash));
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const { role, account } = found;

    if (account.status === "PENDING") {
        return res.status(403).json({ message: "Account awaiting admin approval" });
    }
    if (account.status === "DEACTIVATED") {
        return res.status(403).json({ message: "Account deactivated" });
    }

    const token = jwt.sign({ id: account.id, role }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
    });

    res.cookie("token", token, cookieOptions);
    res.json({
        user: { id: account.id, name: account.name, email: account.email, role },
    });
});

// POST /api/auth/logout
exports.logout = (req, res) => {
    res.clearCookie("token", clearCookieOptions);
    res.json({ message: "Logged out" });
};

// GET /api/auth/me
// Loads the full profile from the right table so the navbar gets avatar, name, etc.
exports.me = asyncHandler(async(req, res) => {
    const account = await findById(req.user.role, req.user.id);
    const { passwordHash, ...profile } = account; // never send the password hash
    res.json({ user: {...profile, role: req.user.role } });
});