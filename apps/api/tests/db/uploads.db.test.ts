import { rm } from "node:fs/promises";
import path from "node:path";
import { uploadResponseSchema } from "@travel-app/shared/contracts/uploads";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { authHeader, createUserFixture, resetDatabase } from "./helpers/testDb.js";

const uploadsRoot = path.resolve(process.env.UPLOADS_DIR || ".tmp/test-uploads");

const { default: app } = await import("../../src/app.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db uploads", () => {
  beforeEach(async () => {
    await resetDatabase();
    await rm(uploadsRoot, { recursive: true, force: true });
    resetRateLimitState();
  });

  it("upload avatar thành công với user đã đăng nhập", async () => {
    const user = await createUserFixture({
      email: "avatar-upload@example.com",
      password: "secret123",
      verified: true,
    });

    const res = await request(app)
      .post("/api/v1/uploads/avatar")
      .set(authHeader(user))
      .attach("file", Buffer.from("fake-image-content"), {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    const payload = uploadResponseSchema.parse(res.body.data);
    expect(payload.publicUrl).toContain("/uploads/avatars/");
    expect(payload.path).toContain("avatars/");
  });

  it("traveler không thể upload ảnh bìa địa điểm owner", async () => {
    const traveler = await createUserFixture({
      email: "traveler-cover@example.com",
      password: "secret123",
      verified: true,
    });

    const res = await request(app)
      .post("/api/v1/uploads/place-cover")
      .set(authHeader(traveler))
      .attach("file", Buffer.from("fake-image-content"), {
        filename: "cover.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: "FORBIDDEN" });
  });
});
