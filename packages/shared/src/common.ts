import { z } from "zod";

export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export const appErrorCodes = [
  "VALIDATION",
  "UNAUTHORIZED",
  "INVALID_TOKEN",
  "FORBIDDEN",
  "RATE_LIMITED",
  "NOT_FOUND",
  "EMAIL_TAKEN",
  "EMAIL_NOT_VERIFIED",
  "EMAIL_ALREADY_VERIFIED",
  "INVALID_CREDENTIALS",
  "ACCOUNT_NOT_FOUND",
  "OTP_INVALID",
  "OTP_EXPIRED",
  "PASSWORD_TOO_WEAK",
  "EMAIL_DELIVERY_FAILED",
  "PLACE_NOT_FOUND",
  "REVIEW_NOT_FOUND",
  "REVIEW_REPLY_NOT_FOUND",
  "PROMOTION_NOT_FOUND",
  "TRIP_NOT_FOUND",
  "TRIP_STOP_NOT_FOUND",
  "COLLECTION_NOT_FOUND",
  "PLACE_UPDATE_NOT_FOUND",
  "NOTIFICATION_NOT_FOUND",
  "BOOKING_OPTION_NOT_FOUND",
  "BOOKING_SLOT_NOT_FOUND",
  "BOOKING_NOT_FOUND",
  "BOOKING_SLOT_UNAVAILABLE",
  "BOOKING_SLOT_FULL",
  "BOOKING_STATUS_INVALID",
  "USERNAME_TAKEN",
  "AI_UNAVAILABLE",
  "AI_RATE_LIMITED",
  "STORAGE_UNAVAILABLE",
  "UNSUPPORTED_MEDIA_TYPE",
  "FILE_TOO_LARGE",
  "MISSING_FILE",
  "INTERNAL",
] as const;

export const appErrorCodeSchema = z.enum(appErrorCodes);

export const apiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  issues: z.unknown().optional(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type AppErrorCode = z.infer<typeof appErrorCodeSchema> | (string & {});
export type ApiSuccess<T> = { ok: true; data: T; meta?: PaginationMeta };
export type ApiFailure = z.infer<typeof apiErrorSchema>;
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
export type ApiOk<T> = ApiSuccess<T>;
export type ApiErr = ApiFailure;

export function ok<T>(data: T, meta?: PaginationMeta): ApiSuccess<T> {
  if (meta) {
    return { ok: true, data, meta };
  }
  return { ok: true, data };
}

export function fail(error: AppErrorCode, issues?: unknown): ApiFailure {
  if (issues !== undefined) {
    return { ok: false, error, issues };
  }
  return { ok: false, error };
}
