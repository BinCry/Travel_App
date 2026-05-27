import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createPlaceFixture,
  createPromotionFixture,
  createUserFixture,
  resetDatabase,
} from "./helpers/testDb.js";

const { default: app } = await import("../../src/app.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db owner permissions", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("traveler không thể gọi owner routes", async () => {
    const traveler = await createUserFixture({
      email: "traveler-owner-route@example.com",
      password: "secret123",
      verified: true,
    });

    const res = await request(app)
      .get("/api/v1/owner/places")
      .set(authHeader(traveler));

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: "FORBIDDEN" });
  });

  it("owner không thể sửa địa điểm của owner khác", async () => {
    const ownerA = await createUserFixture({
      email: "owner-a@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const ownerB = await createUserFixture({
      email: "owner-b@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: ownerA.id });

    const res = await request(app)
      .patch(`/api/v1/owner/places/${place.id}`)
      .set(authHeader(ownerB))
      .send({
        name: "Bị chặn chỉnh sửa",
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "PLACE_NOT_FOUND" });
  });

  it("owner không thể bật tắt ưu đãi của owner khác", async () => {
    const ownerA = await createUserFixture({
      email: "owner-promo-a@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const ownerB = await createUserFixture({
      email: "owner-promo-b@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: ownerA.id });
    const promotion = await createPromotionFixture(place.id);

    const res = await request(app)
      .post(`/api/v1/owner/promotions/${promotion.id}/toggle`)
      .set(authHeader(ownerB));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "PROMOTION_NOT_FOUND" });
  });
});
