import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers["x-request-id"];
  const startedAt = Date.now();
  req.requestId = typeof requestId === "string" && requestId ? requestId : randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  res.on("finish", () => {
    if (env.nodeEnv === "test") {
      return;
    }
    console.info(
      JSON.stringify({
        level: "info",
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      })
    );
  });
  next();
}
