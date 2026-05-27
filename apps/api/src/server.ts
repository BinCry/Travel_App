import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./database/client.js";
import { storageService } from "./services/storage.service.js";

const server = app.listen(env.port, () => {
  console.info(`listening on http://localhost:${env.port}`);
  void storageService.getStatus().then((storage) => {
    console.info(`[storage] local uploads dir: ${storage.uploadsDir}`);
    console.info(`[storage] public base url: ${storage.publicBaseUrl}`);
    if (!storage.publicBaseUrlConfigured) {
      console.warn("[storage] PUBLIC_BASE_URL is not set; upload URLs will fall back to localhost-style defaults.");
    }
    if (!storage.writable) {
      console.error("[storage] uploads directory is not writable.");
    }
  });
});

async function shutdown(signal: string) {
  console.info(`[shutdown] received ${signal}`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
