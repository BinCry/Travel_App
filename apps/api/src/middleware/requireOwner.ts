import type { Request, Response, NextFunction } from "express";
import { prisma } from "../database/client.js";
import { sendError } from "../http/responses.js";

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  void (async () => {
    if (!req.user?.sub) {
      sendError(res, 401, "UNAUTHORIZED");
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { role: true },
    });
    if (!user || user.role !== "OWNER") {
      sendError(res, 403, "FORBIDDEN");
      return;
    }
    next();
  })().catch(next);
}
