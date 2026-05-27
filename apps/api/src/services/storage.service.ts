import { randomBytes } from "node:crypto";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import type { Express } from "express";
import { env } from "../config/env.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const uploadsRoot = path.resolve(env.uploadsDir);

function fileExtensionFromMimeType(mimeType: string) {
  return mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] ?? "bin";
}

async function verifyUploadsRoot(): Promise<boolean> {
  try {
    await mkdir(uploadsRoot, { recursive: true });
    await access(uploadsRoot, constants.R_OK | constants.W_OK);

    const probePath = path.join(
      uploadsRoot,
      `.storage-check-${randomBytes(6).toString("hex")}.tmp`
    );
    await writeFile(probePath, "ok", "utf8");
    await rm(probePath, { force: true });
    return true;
  } catch {
    return false;
  }
}

async function storeFile(
  scope: "reviews" | "places" | "avatars",
  userId: number,
  file: Express.Multer.File
): Promise<{ path: string; publicUrl: string }> {
  if (file.size > MAX_BYTES) {
    throw Object.assign(new Error("FILE_TOO_LARGE"), { statusCode: 413 });
  }

  if (!ALLOWED.has(file.mimetype)) {
    throw Object.assign(new Error("UNSUPPORTED_MEDIA_TYPE"), { statusCode: 415 });
  }

  const ext = fileExtensionFromMimeType(file.mimetype);
  const fileName = `${randomBytes(16).toString("hex")}.${ext}`;
  const relativeDir = path.posix.join(scope, String(userId));
  const absoluteDir = path.join(uploadsRoot, scope, String(userId));
  const relativePath = path.posix.join(relativeDir, fileName);
  const absolutePath = path.join(absoluteDir, fileName);

  try {
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, file.buffer);
  } catch (error) {
    throw Object.assign(
      new Error(error instanceof Error ? error.message : "STORAGE_UNAVAILABLE"),
      { statusCode: 503 as const }
    );
  }

  return {
    path: relativePath,
    publicUrl: `${env.publicBaseUrl}/uploads/${relativePath}`,
  };
}

export const storageService = {
  async getStatus() {
    const writable = await verifyUploadsRoot();
    return {
      driver: "local" as const,
      publicBaseUrl: env.publicBaseUrl,
      publicBaseUrlConfigured: Boolean(process.env.PUBLIC_BASE_URL),
      uploadsDir: uploadsRoot,
      writable,
    };
  },

  async uploadReviewImage(
    userId: number,
    file: Express.Multer.File
  ): Promise<{ path: string; publicUrl: string }> {
    return storeFile("reviews", userId, file);
  },

  async uploadPlaceCover(
    userId: number,
    file: Express.Multer.File
  ): Promise<{ path: string; publicUrl: string }> {
    return storeFile("places", userId, file);
  },

  async uploadAvatar(
    userId: number,
    file: Express.Multer.File
  ): Promise<{ path: string; publicUrl: string }> {
    return storeFile("avatars", userId, file);
  },
};
