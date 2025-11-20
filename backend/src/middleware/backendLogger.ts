import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";

export async function backendLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  const originalJson = res.json.bind(res);

  (res as any).json = (body: any) => {
    const duration = Date.now() - start;
    const haveError = res.statusCode >= 400;

    prisma.log
      .create({
        data: {
          message: `${req.method} ${req.originalUrl} (${res.statusCode}) in ${duration}ms`,
          haveError,
          type: 2,
          userId: req.user?.id,
        },
      })
      .catch(() => {});

    return originalJson(body);
  };

  next();
}