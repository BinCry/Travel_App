import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createPlaceFixture,
  createPromotionFixture,
  createReviewFixture,
  createReviewReplyFixture,
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
  it("owner co the tao va xoa phan hoi cho review cua dia diem minh", async () => {
    const owner = await createUserFixture({
      email: "owner-review@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "traveler-review@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id });
    const review = await createReviewFixture({
      placeId: place.id,
      userId: traveler.id,
    });

    const createRes = await request(app)
      .put(`/api/v1/owner/reviews/${review.id}/reply`)
      .set(authHeader(owner))
      .send({
        content: "Cam on ban da ghe tham.",
      });

    expect(createRes.status).toBe(200);
    expect(createRes.body.data.content).toBe("Cam on ban da ghe tham.");

    const deleteRes = await request(app)
      .delete(`/api/v1/owner/reviews/${review.id}/reply`)
      .set(authHeader(owner));

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({ ok: true });
  });

  it("owner khong the phan hoi review cua dia diem owner khac", async () => {
    const ownerA = await createUserFixture({
      email: "owner-review-a@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const ownerB = await createUserFixture({
      email: "owner-review-b@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "traveler-review-owner-b@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: ownerA.id });
    const review = await createReviewFixture({
      placeId: place.id,
      userId: traveler.id,
    });
    await createReviewReplyFixture({
      reviewId: review.id,
      ownerId: ownerA.id,
      content: "Phan hoi goc",
    });

    const res = await request(app)
      .put(`/api/v1/owner/reviews/${review.id}/reply`)
      .set(authHeader(ownerB))
      .send({
        content: "Khong duoc phep",
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "REVIEW_NOT_FOUND" });
  });
});
