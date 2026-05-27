import { Router } from "express";
import { sendCreated, sendError, sendOk, sendPaginated } from "../http/responses.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { placesService } from "../services/places.service.js";
import { favoritesService } from "../services/favorites.service.js";
import { reviewsService } from "../services/reviews.service.js";
import { wrapAsync } from "../http/errors.js";
import { parsePagination } from "../http/pagination.js";

export const placesRouter = Router();

placesRouter.get(
  "/",
  wrapAsync(async (req, res) => {
    const q = req.query as Record<string, string | undefined>;
    const paging = parsePagination(q);
    const result = await placesService.list(q, paging);
    sendPaginated(res, result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  })
);

placesRouter.get(
  "/:placeId",
  optionalAuth,
  wrapAsync(async (req, res) => {
    const placeId = String(req.params.placeId);
    const dto = await placesService.getById(placeId);
    if (!dto) {
      sendError(res, 404, "NOT_FOUND");
      return;
    }
    const isFavorite = await favoritesService.isFavorite(req.user?.sub, placeId);
    sendOk(res, { ...dto, isFavorite });
  })
);

placesRouter.get(
  "/:placeId/reviews",
  wrapAsync(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, string | undefined>);
    const result = await reviewsService.listForPlace(String(req.params.placeId), paging);
    sendPaginated(res, result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  })
);

placesRouter.post(
  "/:placeId/reviews",
  requireAuth,
  wrapAsync(async (req, res) => {
    const created = await reviewsService.create(
      String(req.params.placeId),
      req.user!.sub,
      req.body
    );
    sendCreated(res, { id: created.id });
  })
);
