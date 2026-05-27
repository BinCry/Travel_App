import { uploadResponseSchema } from "@travel-app/shared/contracts/uploads";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
};

const storageMock = {
  getStatus: vi.fn(),
  uploadReviewImage: vi.fn(),
  uploadPlaceCover: vi.fn(),
  uploadAvatar: vi.fn(),
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../src/services/storage.service.js", () => ({
  storageService: storageMock,
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `user${userId}@example.com` }, env.jwtSecret);
}

describe("upload routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.getStatus.mockResolvedValue({
      driver: "local",
      publicBaseUrl: env.publicBaseUrl,
      publicBaseUrlConfigured: true,
      uploadsDir: "uploads",
      writable: true,
    });
  });

  it("uploads a review image", async () => {
    storageMock.uploadReviewImage.mockResolvedValueOnce({
      path: "reviews/5/review.jpg",
      publicUrl: "http://localhost:8000/uploads/reviews/5/review.jpg",
    });

    const res = await request(app)
      .post("/api/v1/uploads/review-image")
      .set("Authorization", `Bearer ${makeToken(5)}`)
      .attach("file", Buffer.from("fake-image"), {
        filename: "review.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    const payload = uploadResponseSchema.parse(res.body.data);
    expect(payload.path).toContain("reviews/5/");
  });

  it("returns storage unavailable for failed review uploads", async () => {
    storageMock.uploadReviewImage.mockRejectedValueOnce(new Error("STORAGE_UNAVAILABLE"));

    const res = await request(app)
      .post("/api/v1/uploads/review-image")
      .set("Authorization", `Bearer ${makeToken(5)}`)
      .attach("file", Buffer.from("fake-image"), {
        filename: "review.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ ok: false, error: "STORAGE_UNAVAILABLE" });
  });

  it("uploads a place cover for owners", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    storageMock.uploadPlaceCover.mockResolvedValueOnce({
      path: "places/9/cover.jpg",
      publicUrl: "http://localhost:8000/uploads/places/9/cover.jpg",
    });

    const res = await request(app)
      .post("/api/v1/uploads/place-cover")
      .set("Authorization", `Bearer ${makeToken(9)}`)
      .attach("file", Buffer.from("fake-image"), {
        filename: "cover.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    const payload = uploadResponseSchema.parse(res.body.data);
    expect(payload.path).toContain("places/9/");
  });

  it("uploads an avatar for authenticated users", async () => {
    storageMock.uploadAvatar.mockResolvedValueOnce({
      path: "avatars/5/avatar.jpg",
      publicUrl: "http://localhost:8000/uploads/avatars/5/avatar.jpg",
    });

    const res = await request(app)
      .post("/api/v1/uploads/avatar")
      .set("Authorization", `Bearer ${makeToken(5)}`)
      .attach("file", Buffer.from("fake-image"), {
        filename: "avatar.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    const payload = uploadResponseSchema.parse(res.body.data);
    expect(payload.path).toContain("avatars/5/");
  });
});
