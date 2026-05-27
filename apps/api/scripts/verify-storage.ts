import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { env } from "../src/config/env.js";

async function main() {
  const uploadsRoot = path.resolve(env.uploadsDir);
  await mkdir(uploadsRoot, { recursive: true });
  await mkdir(path.join(uploadsRoot, "reviews"), { recursive: true });
  await mkdir(path.join(uploadsRoot, "places"), { recursive: true });
  await access(uploadsRoot, constants.R_OK | constants.W_OK);

  const probePath = path.join(
    uploadsRoot,
    `.storage-check-${randomBytes(6).toString("hex")}.tmp`
  );
  await writeFile(probePath, "ok", "utf8");
  await rm(probePath, { force: true });

  console.info(`[storage] OK -> ${uploadsRoot}`);
  console.info(`[storage] public base url -> ${env.publicBaseUrl}`);
}

void main().catch((error) => {
  console.error("[storage] verification failed");
  console.error(error);
  process.exit(1);
});
