import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// -------------------------------
// Helpers
// -------------------------------
function generateAccountNo(userId: number) {
  return `ACCT-${userId}-${Date.now()}`;
}

function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// =====================================================
// USER: Get Own Account
// =====================================================
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const account = await prisma.account.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            address: true,
            status: true,
            profilePic: true,
          },
        },
      },
    });

    if (!account)
      return res.status(404).json({ message: "Account not found" });

    res.json(account);
  } catch (err) {
    next(err);
  }
});

// =====================================================
// USER: Update own profile
// =====================================================
router.put("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { name, address, profilePic } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        address,
        profilePic,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN: Create new user + auto password + auto account
// =====================================================
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { name, email, mobile, profilePic } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Generate temporary password
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Admin-created users are ACTIVE
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: hashedPassword,
        role: "USER",
        status: "ACTIVE",
        profilePic,
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        balance: 0,
        accountNo: generateAccountNo(user.id),
      },
    });

    res.status(201).json({
      user,
      account,
      tempPassword, // show this only once
    });
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN: List all accounts (ACTIVE + INACTIVE)
// =====================================================
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            status: true,
            address: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        userId: "asc",
      },
    });

    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN: Update user info
// =====================================================
router.put("/:userId", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    const { name, mobile, address, status } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        mobile,
        address,
        status,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN: Activate User
// =====================================================
router.patch("/activate/:userId", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    res.json({ message: "User activated", user: updated });
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN: Deactivate User
// =====================================================
router.patch("/deactivate/:userId", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "INACTIVE" },
    });

    res.json({ message: "User deactivated", user: updated });
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN: Delete everything related to a user
// =====================================================
router.delete("/:userId", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    await prisma.transaction.deleteMany({
      where: { account: { userId } },
    });

    await prisma.account.delete({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User + account deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;