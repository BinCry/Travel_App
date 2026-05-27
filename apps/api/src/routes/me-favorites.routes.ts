import { Router } from "express";
import { sendEmpty, sendOk } from "../http/responses.js";
import { favoritesService } from "../services/favorites.service.js";
import { wrapAsync } from "../http/errors.js";

/**
 * Mounted at /users/me/favorites alongside users router handlers.
 */
export const meFavoritesRouter = Router();

meFavoritesRouter.get(
  "/",
  wrapAsync(async (req, res) => {
    const data = await favoritesService.list(req.user!.sub);
    sendOk(res, data);
  })
);

meFavoritesRouter.post(
  "/places/:placeId",
  wrapAsync(async (req, res) => {
    await favoritesService.add(req.user!.sub, String(req.params.placeId));
    sendEmpty(res, 201);
  })
);

meFavoritesRouter.delete(
  "/places/:placeId",
  wrapAsync(async (req, res) => {
    await favoritesService.remove(req.user!.sub, String(req.params.placeId));
    sendEmpty(res);
  })
);
