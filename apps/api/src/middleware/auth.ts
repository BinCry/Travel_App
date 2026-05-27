import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sendError } from "../http/responses.js";

export type AppJwtPayload = { sub: number; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AppJwtPayload;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, env.jwtSecret) as unknown as AppJwtPayload;
  } catch {
    /* ignore */
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    sendError(res, 401, "UNAUTHORIZED");
    return;
  }
  try {
    req.user = jwt.verify(token, env.jwtSecret) as unknown as AppJwtPayload;
    next();
  } catch {
    sendError(res, 401, "INVALID_TOKEN");
  }
}
