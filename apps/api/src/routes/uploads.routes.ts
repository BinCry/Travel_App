import multer from "multer";
import { uploadResponseSchema } from "@travel-app/shared/contracts/uploads";
import { Router, type Response } from "express";
import { wrapAsync } from "../http/errors.js";
import { sendCreated, sendError } from "../http/responses.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimitMiddleware } from "../middleware/rateLimit.js";
import { requireOwner } from "../middleware/requireOwner.js";
import { storageService } from "../services/storage.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadsRouter = Router();
const uploadRateLimit = createRateLimitMiddleware({
  id: "uploads",
  limit: 20,
  windowMs: 60_000,
});

function sendUploadMiddlewareError(res: Response, code: string) {
  if (code === "LIMIT_FILE_SIZE") {
    sendError(res, 413, "FILE_TOO_LARGE");
    return;
  }
  sendError(res, 400, code);
}

uploadsRouter.post(
  "/review-image",
  requireAuth,
  uploadRateLimit,
  (req, res, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        sendUploadMiddlewareError(res, err.code);
        return;
      }
      next(err as Error | undefined);
    });
  },
  wrapAsync(async (req, res) => {
    if (!req.file) {
      sendError(res, 400, "MISSING_FILE");
      return;
    }
    try {
      const data = uploadResponseSchema.parse(
        await storageService.uploadReviewImage(req.user!.sub, req.file)
      );
      sendCreated(res, data);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "STORAGE_UNAVAILABLE") {
          sendError(res, 503, "STORAGE_UNAVAILABLE");
          return;
        }
        if (e.message === "FILE_TOO_LARGE") {
          sendError(res, 413, "FILE_TOO_LARGE");
          return;
        }
        if (e.message === "UNSUPPORTED_MEDIA_TYPE") {
          sendError(res, 415, "UNSUPPORTED_MEDIA_TYPE");
          return;
        }
      }
      throw e;
    }
  })
);

uploadsRouter.post(
  "/place-cover",
  requireAuth,
  requireOwner,
  uploadRateLimit,
  (req, res, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        sendUploadMiddlewareError(res, err.code);
        return;
      }
      next(err as Error | undefined);
    });
  },
  wrapAsync(async (req, res) => {
    if (!req.file) {
      sendError(res, 400, "MISSING_FILE");
      return;
    }
    try {
      const data = uploadResponseSchema.parse(
        await storageService.uploadPlaceCover(req.user!.sub, req.file)
      );
      sendCreated(res, data);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "STORAGE_UNAVAILABLE") {
          sendError(res, 503, "STORAGE_UNAVAILABLE");
          return;
        }
        if (e.message === "FILE_TOO_LARGE") {
          sendError(res, 413, "FILE_TOO_LARGE");
          return;
        }
        if (e.message === "UNSUPPORTED_MEDIA_TYPE") {
          sendError(res, 415, "UNSUPPORTED_MEDIA_TYPE");
          return;
        }
      }
      throw e;
    }
  })
);

uploadsRouter.post(
  "/avatar",
  requireAuth,
  uploadRateLimit,
  (req, res, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        sendUploadMiddlewareError(res, err.code);
        return;
      }
      next(err as Error | undefined);
    });
  },
  wrapAsync(async (req, res) => {
    if (!req.file) {
      sendError(res, 400, "MISSING_FILE");
      return;
    }
    try {
      const data = uploadResponseSchema.parse(
        await storageService.uploadAvatar(req.user!.sub, req.file)
      );
      sendCreated(res, data);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "STORAGE_UNAVAILABLE") {
          sendError(res, 503, "STORAGE_UNAVAILABLE");
          return;
        }
        if (e.message === "FILE_TOO_LARGE") {
          sendError(res, 413, "FILE_TOO_LARGE");
          return;
        }
        if (e.message === "UNSUPPORTED_MEDIA_TYPE") {
          sendError(res, 415, "UNSUPPORTED_MEDIA_TYPE");
          return;
        }
      }
      throw e;
    }
  })
);
