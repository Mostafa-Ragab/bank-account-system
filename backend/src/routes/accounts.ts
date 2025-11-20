import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

function generateAccountNo(userId: number) {
  return `ACCT-${userId}-${Date.now()}`;
}

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

router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, mobile: true, status: true },
        },
      },
    });
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

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
          },
        },
      },
    });

    res.json(account);
  } catch (err) {
    next(err);
  }
});

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