import { Router } from "express";
import { wrapAsync } from "../http/errors.js";
import { parsePagination } from "../http/pagination.js";
import { sendCreated, sendEmpty, sendOk, sendPaginated } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { tripsService } from "../services/trips.service.js";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.get(
  "/",
  wrapAsync(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, string | undefined>);
    const result = await tripsService.list(req.user!.sub, paging);
    sendPaginated(res, result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  })
);

tripsRouter.post(
  "/",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.create(req.user!.sub, req.body);
    sendCreated(res, trip);
  })
);

tripsRouter.get(
  "/:tripId",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.get(req.user!.sub, String(req.params.tripId));
    sendOk(res, trip);
  })
);

tripsRouter.patch(
  "/:tripId",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.update(req.user!.sub, String(req.params.tripId), req.body);
    sendOk(res, trip);
  })
);

tripsRouter.delete(
  "/:tripId",
  wrapAsync(async (req, res) => {
    await tripsService.remove(req.user!.sub, String(req.params.tripId));
    sendEmpty(res);
  })
);

tripsRouter.post(
  "/:tripId/duplicate",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.duplicate(req.user!.sub, String(req.params.tripId));
    sendCreated(res, trip);
  })
);

tripsRouter.post(
  "/:tripId/stops",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.createStop(req.user!.sub, String(req.params.tripId), req.body);
    sendCreated(res, trip);
  })
);

tripsRouter.patch(
  "/:tripId/stops/:stopId",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.updateStop(
      req.user!.sub,
      String(req.params.tripId),
      String(req.params.stopId),
      req.body
    );
    sendOk(res, trip);
  })
);

tripsRouter.delete(
  "/:tripId/stops/:stopId",
  wrapAsync(async (req, res) => {
    const trip = await tripsService.removeStop(
      req.user!.sub,
      String(req.params.tripId),
      String(req.params.stopId)
    );
    sendOk(res, trip);
  })
);
