import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimitMiddleware } from "../middleware/rateLimit.js";
import { sendOk } from "../http/responses.js";
import { aiService } from "../services/ai.service.js";
import { wrapAsync } from "../http/errors.js";

export const aiRouter = Router();
const aiRateLimit = createRateLimitMiddleware({
  id: "ai",
  limit: 6,
  windowMs: 60_000,
});

aiRouter.post(
  "/trip-plan",
  requireAuth,
  aiRateLimit,
  wrapAsync(async (req, res) => {
    const data = await aiService.planTrip(req.body);
    sendOk(res, data);
  })
);
