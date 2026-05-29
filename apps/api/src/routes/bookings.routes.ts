import { Router } from "express";
import { sendCreated, sendOk, sendPaginated } from "../http/responses.js";
import { wrapAsync } from "../http/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { parsePagination } from "../http/pagination.js";
import { bookingsService } from "../services/bookings.service.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.get(
  "/places/:placeId/options",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.listPlaceAvailability(String(req.params.placeId));
    sendOk(res, data);
  })
);

bookingsRouter.get(
  "/",
  wrapAsync(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, string | undefined>);
    const result = await bookingsService.listMine(req.user!.sub, paging);
    sendPaginated(res, result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  })
);

bookingsRouter.post(
  "/",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.create(req.user!.sub, req.body);
    sendCreated(res, data);
  })
);

bookingsRouter.post(
  "/:bookingId/cancel",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.cancel(req.user!.sub, String(req.params.bookingId));
    sendOk(res, data);
  })
);
