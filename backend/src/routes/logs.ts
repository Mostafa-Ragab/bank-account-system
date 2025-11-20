import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { message, haveError, type } = req.body;

    const log = await prisma.log.create({
      data: {
        message,
        haveError: !!haveError,
        type: type ?? 1,
        userId: req.user?.id,
      },
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

export default router;