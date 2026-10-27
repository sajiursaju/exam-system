const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const profileSelect = require("../lib/profileSelect");
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

// POST /api/auth/register
exports.register = asyncHandler(async(req, res) => {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
        data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            role: data.role,
            status: "PENDING", // an admin must approve first
        },
    });

    res.status(201).json({ message: "Registered. Wait for admin approval." });
});

// POST /api/auth/login
exports.login = asyncHandler(async(req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
    });

    const ok = user && (await bcrypt.compare(data.password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    if (user.status === "PENDING") {
        return res.status(403).json({ message: "Account awaiting admin approval" });
    }
    if (user.status === "DEACTIVATED") {
        return res.status(403).json({ message: "Account deactivated" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
    });

    res.cookie("token", token, cookieOptions);
    res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});

// POST /api/auth/logout
exports.logout = (req, res) => {
    res.clearCookie("token", cookieOptions);
    res.json({ message: "Logged out" });
};

// GET /api/auth/me
// Loads the full profile from the database so the navbar gets avatar, name, etc.
exports.me = asyncHandler(async(req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: profileSelect,
    });
    res.json({ user });
});