import type { RequestHandler } from "express";
import { sendError } from "../http/responses.js";

type RateLimitConfig = {
  id: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const rateLimitStores = new Map<string, Map<string, Bucket>>();

function getStore(id: string) {
  let store = rateLimitStores.get(id);
  if (!store) {
    store = new Map<string, Bucket>();
    rateLimitStores.set(id, store);
  }
  return store;
}

function getClientKey(ip: string | undefined, id: string) {
  return `${id}:${ip || "unknown"}`;
}

export function createRateLimitMiddleware(config: RateLimitConfig): RequestHandler {
  return (req, res, next) => {
    const store = getStore(config.id);
    const key = getClientKey(req.ip, config.id);
    const now = Date.now();
    const bucket = store.get(key);

    if (!bucket || bucket.resetAt <= now) {
      store.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      next();
      return;
    }

    if (bucket.count >= config.limit) {
      res.setHeader("Retry-After", Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
      sendError(res, 429, "RATE_LIMITED");
      return;
    }

    bucket.count += 1;
    next();
  };
}

export function resetRateLimitState() {
  rateLimitStores.clear();
}
