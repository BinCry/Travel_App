import { fail } from "@travel-app/shared/common";

export function jsonError(_status: number, code: string, issues?: unknown) {
  return fail(code, issues);
}

export function wrapAsync(
  handler: (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => Promise<void>
) {
  return (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => {
    void handler(req, res, next).catch(next);
  };
}

export function httpErrorMiddleware(
  err: unknown,
  req: import("express").Request,
  res: import("express").Response,
  _next: import("express").NextFunction
) {
  const status =
    err &&
    typeof err === "object" &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
      ? (err as { statusCode: number }).statusCode
      : 500;
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "INTERNAL";
  const issues =
    err &&
    typeof err === "object" &&
    "issues" in err &&
    (err as { issues?: unknown }).issues !== undefined
      ? (err as { issues: unknown }).issues
      : undefined;
  if (process.env.NODE_ENV !== "test") {
    console.error(
      JSON.stringify({
        level: "error",
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
        status,
        error: message,
        issues,
      })
    );
  }
  if (!res.headersSent) {
    res
      .status(status >= 400 && status < 600 ? status : 500)
      .json(jsonError(status, message, issues));
  }
}
