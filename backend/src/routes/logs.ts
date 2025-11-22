import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { message, haveError, userId, type } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid log message" });
    }

    const finalType =
      type === 1 || type === 2 ? type : 1;

    const uid =
      typeof userId === "number" ? userId : null;

    const entry = await prisma.log.create({
      data: {
        message,
        haveError: !!haveError,
        type: finalType,
        userId: uid
      },
    });

    return res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;