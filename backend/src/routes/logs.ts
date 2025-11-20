import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { log, haveError, userId, type } = req.body;

    const entry = await prisma.log.create({
      data: {
        log,
        haveError,
        userId: userId || null,
        type,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;