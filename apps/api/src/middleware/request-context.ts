import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers["x-request-id"];
  req.requestId = typeof requestId === "string" && requestId ? requestId : randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}
