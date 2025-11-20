import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// ----------------------------------------------------
// Helper: Generate Account Number
// ----------------------------------------------------
function generateAccountNo(userId: number) {
  return `ACCT-${userId}-${Date.now()}`;
}

// ====================================================
// POST /api/auth/register  → User self-registration
// Creates user + auto account (status INACTIVE)
// ====================================================
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, mobile, password, profilePic } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user (status INACTIVE until admin activates)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: hashed,
        profilePic: profilePic || null,
        role: "USER",
        status: "INACTIVE",
      },
    });

    // Create account linked to user
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        balance: 0,
        accountNo: generateAccountNo(user.id),
      },
    });

    return res.status(201).json({
      message:
        "Registered successfully. Your account is inactive until admin activation.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
      account: {
        id: account.id,
        accountNo: account.accountNo,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ====================================================
// POST /api/auth/login
// ====================================================
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is not active. Please contact admin.",
      });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;