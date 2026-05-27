import { Router } from "express";
import { sendEmpty, sendOk } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { reviewsService } from "../services/reviews.service.js";
import { wrapAsync } from "../http/errors.js";

export const reviewsRouter = Router();

reviewsRouter.patch(
  "/:reviewId",
  requireAuth,
  wrapAsync(async (req, res) => {
    const data = await reviewsService.update(
      String(req.params.reviewId),
      req.user!.sub,
      req.body
    );
    sendOk(res, data);
  })
);

reviewsRouter.delete(
  "/:reviewId",
  requireAuth,
  wrapAsync(async (req, res) => {
    await reviewsService.remove(String(req.params.reviewId), req.user!.sub);
    sendEmpty(res);
  })
);

reviewsRouter.post(
  "/:reviewId/likes/toggle",
  requireAuth,
  wrapAsync(async (req, res) => {
    const data = await reviewsService.toggleLike(
      String(req.params.reviewId),
      req.user!.sub
    );
    sendOk(res, data);
  })
);
