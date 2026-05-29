import { Router } from "express";
import { sendEmpty, sendOk } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { wrapAsync } from "../http/errors.js";
import { notificationsService } from "../services/notifications.service.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  wrapAsync(async (req, res) => {
    const data = await notificationsService.list(req.user!.sub);
    sendOk(res, data);
  })
);

notificationsRouter.post(
  "/read-all",
  wrapAsync(async (req, res) => {
    await notificationsService.markAllRead(req.user!.sub);
    sendEmpty(res);
  })
);

notificationsRouter.post(
  "/:notificationId/read",
  wrapAsync(async (req, res) => {
    const data = await notificationsService.markRead(
      req.user!.sub,
      String(req.params.notificationId)
    );
    sendOk(res, data);
  })
);

notificationsRouter.delete(
  "/:notificationId",
  wrapAsync(async (req, res) => {
    await notificationsService.remove(req.user!.sub, String(req.params.notificationId));
    sendEmpty(res);
  })
);
