import { fail, ok, type AppErrorCode, type PaginationMeta } from "@travel-app/shared/common";
import type { Response } from "express";

export function sendOk<T>(res: Response, data: T) {
  res.json(ok(data));
}

export function sendCreated<T>(res: Response, data: T) {
  res.status(201).json(ok(data));
}

export function sendPaginated<T>(res: Response, data: T, meta: PaginationMeta) {
  res.json(ok(data, meta));
}

export function sendEmpty(res: Response, status = 200) {
  res.status(status).json({ ok: true });
}

export function sendError(
  res: Response,
  status: number,
  error: AppErrorCode,
  issues?: unknown
) {
  res.status(status).json(fail(error, issues));
}
