import { Router } from "express";
import { sendCreated, sendEmpty, sendOk, sendPaginated } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { requireOwner } from "../middleware/requireOwner.js";
import { ownerService } from "../services/owner.service.js";
import { bookingsService } from "../services/bookings.service.js";
import { wrapAsync } from "../http/errors.js";
import { parsePagination } from "../http/pagination.js";

export const ownerRouter = Router();

ownerRouter.use(requireAuth, requireOwner);

ownerRouter.get(
  "/places",
  wrapAsync(async (req, res) => {
    const data = await ownerService.listPlaces(req.user!.sub);
    sendOk(res, data);
  })
);

ownerRouter.get(
  "/analytics/summary",
  wrapAsync(async (req, res) => {
    const data = await ownerService.getAnalyticsSummary(req.user!.sub);
    sendOk(res, data);
  })
);

ownerRouter.post(
  "/places",
  wrapAsync(async (req, res) => {
    const data = await ownerService.createPlace(req.user!.sub, req.body);
    sendCreated(res, data);
  })
);

ownerRouter.get(
  "/places/:placeId",
  wrapAsync(async (req, res) => {
    const data = await ownerService.getPlace(req.user!.sub, String(req.params.placeId));
    sendOk(res, data);
  })
);

ownerRouter.patch(
  "/places/:placeId",
  wrapAsync(async (req, res) => {
    const data = await ownerService.updatePlace(
      req.user!.sub,
      String(req.params.placeId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.delete(
  "/places/:placeId",
  wrapAsync(async (req, res) => {
    await ownerService.deletePlace(req.user!.sub, String(req.params.placeId));
    sendEmpty(res);
  })
);

ownerRouter.get(
  "/places/:placeId/promotions",
  wrapAsync(async (req, res) => {
    const data = await ownerService.listPromotions(
      req.user!.sub,
      String(req.params.placeId)
    );
    sendOk(res, data);
  })
);

ownerRouter.get(
  "/places/:placeId/reviews",
  wrapAsync(async (req, res) => {
    const data = await ownerService.listPlaceReviews(req.user!.sub, String(req.params.placeId));
    sendOk(res, data);
  })
);

ownerRouter.post(
  "/places/:placeId/updates",
  wrapAsync(async (req, res) => {
    const data = await ownerService.createPlaceUpdate(
      req.user!.sub,
      String(req.params.placeId),
      req.body
    );
    sendCreated(res, data);
  })
);

ownerRouter.get(
  "/places/:placeId/booking-options",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.listOwnerOptions(req.user!.sub, String(req.params.placeId));
    sendOk(res, data);
  })
);

ownerRouter.post(
  "/places/:placeId/booking-options",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.createOwnerOption(
      req.user!.sub,
      String(req.params.placeId),
      req.body
    );
    sendCreated(res, data);
  })
);

ownerRouter.get(
  "/places/:placeId/bookings",
  wrapAsync(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, string | undefined>);
    const result = await bookingsService.listOwnerBookings(
      req.user!.sub,
      String(req.params.placeId),
      paging
    );
    sendPaginated(res, result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  })
);

ownerRouter.post(
  "/places/:placeId/promotions",
  wrapAsync(async (req, res) => {
    const data = await ownerService.createPromotion(
      req.user!.sub,
      String(req.params.placeId),
      req.body
    );
    sendCreated(res, data);
  })
);

ownerRouter.patch(
  "/promotions/:promotionId",
  wrapAsync(async (req, res) => {
    const data = await ownerService.updatePromotion(
      req.user!.sub,
      String(req.params.promotionId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.patch(
  "/booking-options/:optionId",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.updateOwnerOption(
      req.user!.sub,
      String(req.params.optionId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.post(
  "/booking-options/:optionId/slots",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.createOwnerSlot(
      req.user!.sub,
      String(req.params.optionId),
      req.body
    );
    sendCreated(res, data);
  })
);

ownerRouter.put(
  "/reviews/:reviewId/reply",
  wrapAsync(async (req, res) => {
    const data = await ownerService.upsertReviewReply(
      req.user!.sub,
      String(req.params.reviewId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.patch(
  "/slots/:slotId",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.updateOwnerSlot(
      req.user!.sub,
      String(req.params.slotId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.patch(
  "/bookings/:bookingId/status",
  wrapAsync(async (req, res) => {
    const data = await bookingsService.updateOwnerBookingStatus(
      req.user!.sub,
      String(req.params.bookingId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.post(
  "/promotions/:promotionId/toggle",
  wrapAsync(async (req, res) => {
    const data = await ownerService.togglePromotion(
      req.user!.sub,
      String(req.params.promotionId)
    );
    sendOk(res, data);
  })
);

ownerRouter.delete(
  "/promotions/:promotionId",
  wrapAsync(async (req, res) => {
    await ownerService.deletePromotion(req.user!.sub, String(req.params.promotionId));
    sendEmpty(res);
  })
);

ownerRouter.delete(
  "/booking-options/:optionId",
  wrapAsync(async (req, res) => {
    await bookingsService.deleteOwnerOption(req.user!.sub, String(req.params.optionId));
    sendEmpty(res);
  })
);

ownerRouter.delete(
  "/slots/:slotId",
  wrapAsync(async (req, res) => {
    await bookingsService.deleteOwnerSlot(req.user!.sub, String(req.params.slotId));
    sendEmpty(res);
  })
);

ownerRouter.delete(
  "/reviews/:reviewId/reply",
  wrapAsync(async (req, res) => {
    await ownerService.deleteReviewReply(req.user!.sub, String(req.params.reviewId));
    sendEmpty(res);
  })
);

ownerRouter.patch(
  "/place-updates/:updateId",
  wrapAsync(async (req, res) => {
    const data = await ownerService.updatePlaceUpdate(
      req.user!.sub,
      String(req.params.updateId),
      req.body
    );
    sendOk(res, data);
  })
);

ownerRouter.delete(
  "/place-updates/:updateId",
  wrapAsync(async (req, res) => {
    await ownerService.deletePlaceUpdate(req.user!.sub, String(req.params.updateId));
    sendEmpty(res);
  })
);
