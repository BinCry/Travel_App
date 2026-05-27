import { Router } from "express";
import { wrapAsync } from "../http/errors.js";
import { sendCreated, sendError, sendOk } from "../http/responses.js";
import { createRateLimitMiddleware } from "../middleware/rateLimit.js";
import { authService } from "../services/auth.service.js";
import { emailVerificationService } from "../services/email-verification.service.js";
import { passwordResetService } from "../services/password-reset.service.js";

export const authRouter = Router();
const authRateLimit = createRateLimitMiddleware({
  id: "auth",
  limit: 12,
  windowMs: 60_000,
});

function handleKnownAuthError(e: unknown, res: import("express").Response) {
  if (!(e instanceof Error)) {
    return false;
  }
  switch (e.message) {
    case "EMAIL_TAKEN":
      sendError(res, 409, "EMAIL_TAKEN");
      return true;
    case "INVALID_CREDENTIALS":
      sendError(res, 401, "INVALID_CREDENTIALS");
      return true;
    case "EMAIL_NOT_VERIFIED":
      sendError(res, 403, "EMAIL_NOT_VERIFIED");
      return true;
    case "EMAIL_ALREADY_VERIFIED":
      sendError(res, 409, "EMAIL_ALREADY_VERIFIED");
      return true;
    case "ACCOUNT_NOT_FOUND":
      sendError(res, 404, "ACCOUNT_NOT_FOUND");
      return true;
    case "RATE_LIMITED":
      sendError(res, 429, "RATE_LIMITED", (e as { issues?: unknown }).issues);
      return true;
    default:
      return false;
  }
}

authRouter.post(
  "/register",
  authRateLimit,
  wrapAsync(async (req, res) => {
    try {
      const out = await authService.register(req.body);
      sendCreated(res, out);
    } catch (e) {
      if (handleKnownAuthError(e, res)) {
        return;
      }
      throw e;
    }
  })
);

authRouter.post(
  "/register/verify",
  authRateLimit,
  wrapAsync(async (req, res) => {
    try {
      const out = await emailVerificationService.verifyEmail(req.body);
      sendOk(res, out);
    } catch (e) {
      if (handleKnownAuthError(e, res)) {
        return;
      }
      throw e;
    }
  })
);

authRouter.post(
  "/register/resend-otp",
  authRateLimit,
  wrapAsync(async (req, res) => {
    try {
      const out = await emailVerificationService.resendVerification(req.body);
      sendOk(res, out);
    } catch (e) {
      if (handleKnownAuthError(e, res)) {
        return;
      }
      throw e;
    }
  })
);

authRouter.post(
  "/forgot-password",
  authRateLimit,
  wrapAsync(async (req, res) => {
    try {
      const out = await passwordResetService.requestReset(req.body);
      sendOk(res, out);
    } catch (e) {
      if (handleKnownAuthError(e, res)) {
        return;
      }
      throw e;
    }
  })
);

authRouter.post(
  "/forgot-password/verify",
  authRateLimit,
  wrapAsync(async (req, res) => {
    const out = await passwordResetService.verifyOtp(req.body);
    sendOk(res, out);
  })
);

authRouter.post(
  "/reset-password",
  authRateLimit,
  wrapAsync(async (req, res) => {
    try {
      const out = await passwordResetService.resetPassword(req.body);
      sendOk(res, out);
    } catch (e) {
      if (handleKnownAuthError(e, res)) {
        return;
      }
      throw e;
    }
  })
);

authRouter.post(
  "/login",
  authRateLimit,
  wrapAsync(async (req, res) => {
    try {
      const out = await authService.login(req.body);
      sendOk(res, out);
    } catch (e) {
      if (handleKnownAuthError(e, res)) {
        return;
      }
      throw e;
    }
  })
);
