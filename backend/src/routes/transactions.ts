import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post(
  "/credit",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const { accountId, amount } = req.body;

      const account = await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: amount },
          transactions: {
            create: {
              type: "CREDIT",
              amount,
            },
          },
        },
      });

      res.json(account);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/debit",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const { accountId, amount } = req.body;

      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      if (account.balance < amount) {
        return res.status(400).json({
          message: "Insufficient balance for debit transaction",
        });
      }

      const updated = await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { decrement: amount },
          transactions: {
            create: {
              type: "DEBIT",
              amount,
            },
          },
        },
      });

      res.json(updated);
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
      include: { transactions: true },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const { transactions } = account;

    const debitHistory = transactions.filter(
      (tx) => tx.type === "DEBIT"
    );

    const creditHistory = transactions.filter(
      (tx) => tx.type === "CREDIT"
    );

    res.json({
      balance: account.balance,
      debitHistory,
      creditHistory,
    });
  } catch (err) {
    next(err);
  }
});

export default router;