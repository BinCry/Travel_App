import { wrapAsync } from "../http/errors.js";
import { parsePagination } from "../http/pagination.js";
import { sendError, sendOk, sendPaginated } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { reviewsService } from "../services/reviews.service.js";
import { usersService } from "../services/users.service.js";
import { meFavoritesRouter } from "./me-favorites.routes.js";
import { Router } from "express";

export const usersRouter = Router();

usersRouter.get(
  "/me",
  requireAuth,
  wrapAsync(async (req, res) => {
    const u = await usersService.me(req.user!.sub);
    sendOk(res, u);
  })
);

usersRouter.patch(
  "/me",
  requireAuth,
  wrapAsync(async (req, res) => {
    try {
      const u = await usersService.updateMe(req.user!.sub, req.body);
      sendOk(res, u);
    } catch (e) {
      if (e instanceof Error && e.message === "USERNAME_TAKEN") {
        sendError(res, 409, "USERNAME_TAKEN");
        return;
      }
      throw e;
    }
  })
);

usersRouter.get(
  "/me/reviews",
  requireAuth,
  wrapAsync(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, string | undefined>);
    const result = await reviewsService.listForUser(req.user!.sub, paging);
    sendPaginated(res, result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  })
);

usersRouter.post(
  "/me/change-password",
  requireAuth,
  wrapAsync(async (req, res) => {
    const result = await usersService.changePassword(req.user!.sub, req.body);
    sendOk(res, result);
  })
);

usersRouter.post(
  "/me/delete",
  requireAuth,
  wrapAsync(async (req, res) => {
    try {
      const result = await usersService.deleteAccount(req.user!.sub, req.body);
      sendOk(res, result);
    } catch (e) {
      if (e instanceof Error && e.message === "INVALID_CREDENTIALS") {
        sendError(res, 401, "INVALID_CREDENTIALS");
        return;
      }
      throw e;
    }
  })
);

usersRouter.use("/me/favorites", requireAuth, meFavoritesRouter);
