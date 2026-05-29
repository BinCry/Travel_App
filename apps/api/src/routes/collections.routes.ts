import { Router } from "express";
import { collectionPlaceMutationRequestSchema } from "@travel-app/shared/contracts/collections";
import { sendCreated, sendEmpty, sendOk } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { wrapAsync } from "../http/errors.js";
import { collectionsService } from "../services/collections.service.js";

export const collectionsRouter = Router();

collectionsRouter.use(requireAuth);

collectionsRouter.get(
  "/",
  wrapAsync(async (req, res) => {
    const data = await collectionsService.list(
      req.user!.sub,
      req.query as Record<string, string | undefined>
    );
    sendOk(res, data);
  })
);

collectionsRouter.post(
  "/",
  wrapAsync(async (req, res) => {
    const data = await collectionsService.create(req.user!.sub, req.body);
    sendCreated(res, data);
  })
);

collectionsRouter.get(
  "/:collectionId",
  wrapAsync(async (req, res) => {
    const data = await collectionsService.getDetail(
      req.user!.sub,
      String(req.params.collectionId)
    );
    sendOk(res, data);
  })
);

collectionsRouter.patch(
  "/:collectionId",
  wrapAsync(async (req, res) => {
    const data = await collectionsService.update(
      req.user!.sub,
      String(req.params.collectionId),
      req.body
    );
    sendOk(res, data);
  })
);

collectionsRouter.delete(
  "/:collectionId",
  wrapAsync(async (req, res) => {
    await collectionsService.remove(req.user!.sub, String(req.params.collectionId));
    sendEmpty(res);
  })
);

collectionsRouter.post(
  "/:collectionId/places",
  wrapAsync(async (req, res) => {
    const body = collectionPlaceMutationRequestSchema.parse(req.body);
    await collectionsService.addPlace(
      req.user!.sub,
      String(req.params.collectionId),
      body.placeId
    );
    sendEmpty(res, 201);
  })
);

collectionsRouter.delete(
  "/:collectionId/places/:placeId",
  wrapAsync(async (req, res) => {
    await collectionsService.removePlace(
      req.user!.sub,
      String(req.params.collectionId),
      String(req.params.placeId)
    );
    sendEmpty(res);
  })
);
