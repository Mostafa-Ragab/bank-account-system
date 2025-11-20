import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { message, haveError, userId, type } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Log 'message' is required" });
    }

    const entry = await prisma.log.create({
      data: {
        message,
        haveError: !!haveError,
        type: typeof type === "number" ? type : 1, // 1 = Web UI
        userId: userId ?? null,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;