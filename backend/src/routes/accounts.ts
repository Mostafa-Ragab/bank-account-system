import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

function generateAccountNo(userId: number) {
  return `ACCT-${userId}-${Date.now()}`;
}

// ========================
// Admin: create account
// ========================
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { name, email, mobile, profilePic } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: "",
        profilePic,
        role: "USER",
        status: "ACTIVE",
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        balance: 0,
        accountNo: generateAccountNo(user.id),
      },
    });

    res.status(201).json({ user, account });
  } catch (err) {
    next(err);
  }
});

// ========================
// Admin: list all accounts
// ========================
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
    });
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

// ========================
// Admin: update user (name / mobile / address / status)
// ========================
router.put(
  "/:userId",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.userId);
      const { name, mobile, address, status } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          mobile,
          address,
          status,
        },
      });

      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// ========================
// Admin: ACTIVATE user
// ========================
router.patch(
  "/activate/:userId",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.userId);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      });

      res.json({ message: "User activated", user });
    } catch (err) {
      next(err);
    }
  }
);

// ========================
// Admin: DEACTIVATE user
// ========================
router.patch(
  "/deactivate/:userId",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.userId);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: "INACTIVE" },
      });

      res.json({ message: "User deactivated", user });
    } catch (err) {
      next(err);
    }
  }
);

// ========================
// Admin: delete account + user
// ========================
router.delete(
  "/:userId",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
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

      res.json({ message: "Account and user deleted" });
    } catch (err) {
      next(err);
    }
  }
);

// ========================
// User: get own account
// ========================
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

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

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
  } catch (err) {
    next(err);
  }
});

// ========================
// User: update own profile
// ========================
router.put("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, address, profilePic } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, address, profilePic },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;