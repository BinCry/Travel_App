import { apiUserSchema } from "@travel-app/shared/contracts/auth";
import { userReviewListItemSchema } from "@travel-app/shared/contracts/reviews";
import {
  changePasswordResponseSchema,
  deleteAccountResponseSchema,
} from "@travel-app/shared/contracts/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  review: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  passwordResetOtp: {
    deleteMany: vi.fn(),
  },
  emailVerificationOtp: {
    deleteMany: vi.fn(),
  },
  place: {
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `user${userId}@example.com` }, env.jwtSecret);
}

describe("users routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the current user profile", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 10,
      email: "traveler@example.com",
      emailVerifiedAt: new Date(),
      fullName: "Traveler One",
      username: "traveler1",
      location: "Huế",
      avatarUrl: "https://cdn.example.com/avatar.jpg",
      role: "TRAVELER",
    });

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(200);
    const payload = apiUserSchema.parse(res.body.data);
    expect(payload.role).toBe("traveler");
    expect(payload.name).toBe("Traveler One");
    expect(payload.emailVerified).toBe(true);
  });

  it("returns validation errors for invalid profile updates", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        avatarUrl: "not-a-url",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("VALIDATION");
  });

  it("returns conflict when username is already taken", async () => {
    prismaMock.user.update.mockRejectedValueOnce({ code: "P2002" });

    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        username: "taken-name",
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ ok: false, error: "USERNAME_TAKEN" });
  });

  it("lists the current user's reviews with pagination metadata", async () => {
    prismaMock.review.count.mockResolvedValueOnce(1);
    prismaMock.review.findMany.mockResolvedValueOnce([
      {
        id: "review-1",
        placeId: "place-1",
        rating: 5,
        content: "Excellent stay.",
        createdAt: new Date("2024-10-10T00:00:00.000Z"),
        place: {
          id: "place-1",
          name: "Gion District",
          coverImageUrl: "https://cdn.example.com/place.jpg",
          region: "Kyoto, Japan",
        },
        images: [{ url: "https://cdn.example.com/review.jpg" }],
        _count: { likes: 7 },
      },
    ]);

    const res = await request(app)
      .get("/api/v1/users/me/reviews?limit=1&offset=2")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.meta).toEqual({ total: 1, limit: 1, offset: 2 });
    const payload = userReviewListItemSchema.parse(res.body.data[0]);
    expect(payload.placeName).toBe("Gion District");
    expect(payload.likes).toBe(7);
  });

  it("changes password with the correct current password", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 10,
      passwordHash: await bcrypt.hash("old-secret123", 4),
    });
    prismaMock.user.update.mockResolvedValueOnce({});

    const res = await request(app)
      .post("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        currentPassword: "old-secret123",
        newPassword: "new-secret123",
      });

    expect(res.status).toBe(200);
    const payload = changePasswordResponseSchema.parse(res.body.data);
    expect(payload.message).toBe("Đổi mật khẩu thành công.");
  });

  it("rejects change-password when current password is wrong", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 10,
      passwordHash: await bcrypt.hash("old-secret123", 4),
    });

    const res = await request(app)
      .post("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        currentPassword: "wrong-password",
        newPassword: "new-secret123",
      });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "INVALID_CREDENTIALS" });
  });

  it("deletes an owner account and cascades owned data cleanup", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 20,
      email: "lan.owner@example.com",
      passwordHash: await bcrypt.hash("owner-secret123", 4),
      role: "OWNER",
    });
    prismaMock.place.deleteMany.mockResolvedValueOnce({ count: 2 });
    prismaMock.passwordResetOtp.deleteMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.emailVerificationOtp.deleteMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.user.delete.mockResolvedValueOnce({});

    const res = await request(app)
      .post("/api/v1/users/me/delete")
      .set("Authorization", `Bearer ${makeToken(20)}`)
      .send({
        currentPassword: "owner-secret123",
      });

    expect(res.status).toBe(200);
    const payload = deleteAccountResponseSchema.parse(res.body.data);
    expect(payload.message).toContain("địa điểm");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });
});
