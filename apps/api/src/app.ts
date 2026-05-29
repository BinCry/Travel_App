import express from "express";
import path from "node:path";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { loadOpenApiDocument } from "./openapi/loadOpenApiDocument.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { placesRouter } from "./routes/places.routes.js";
import { reviewsRouter } from "./routes/reviews.routes.js";
import { uploadsRouter } from "./routes/uploads.routes.js";
import { ownerRouter } from "./routes/owner.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { tripsRouter } from "./routes/trips.routes.js";
import { bookingsRouter } from "./routes/bookings.routes.js";
import { httpErrorMiddleware } from "./http/errors.js";
import { sendError } from "./http/responses.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection } from "./database/client.js";
import { requestContext } from "./middleware/request-context.js";
import { storageService } from "./services/storage.service.js";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const app = express();
if (env.trustProxy) {
  app.set("trust proxy", true);
}

const corsOptions = env.allowedOrigins.length
  ? {
      origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || env.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(Object.assign(new Error("FORBIDDEN"), { statusCode: 403 }));
      },
    }
  : undefined;

app.use(cors(corsOptions));
app.use(requestContext);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(env.uploadsDir)));

const openApiDoc = loadOpenApiDocument();

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDoc);
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDoc, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Travel App API",
  })
);

const api = express.Router();
api.use("/auth", authRouter);
api.use("/users", usersRouter);
api.use("/places", placesRouter);
api.use("/reviews", reviewsRouter);
api.use("/uploads", uploadsRouter);
api.use("/owner", ownerRouter);
api.use("/ai", aiRouter);
api.use("/trips", tripsRouter);
api.use("/bookings", bookingsRouter);
app.use("/api/v1", api);

app.get("/health", async (_req, res) => {
  const [storage, databaseConnected] = await Promise.all([
    storageService.getStatus(),
    checkDatabaseConnection(),
  ]);
  const ok = storage.writable && databaseConnected;
  res.status(ok ? 200 : 503).json({
    ok,
    database: {
      connected: databaseConnected,
    },
    storage,
  });
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    sendError(res, 400, "VALIDATION", err.flatten());
    return;
  }
  httpErrorMiddleware(err, _req, res, next);
});

export default app;
