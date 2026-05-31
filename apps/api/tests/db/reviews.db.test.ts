import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createPlaceFixture,
  createReviewFixture,
  createReviewReplyFixture,
  createUserFixture,
  resetDatabase,
} from "./helpers/testDb.js";

const { default: app } = await import("../../src/app.js");
const { prisma } = await import("../../src/database/client.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db reviews hardening", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("traveler chỉ có thể tạo một review cho mỗi địa điểm", async () => {
    const owner = await createUserFixture({
      email: "review-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "review-traveler@example.com",
      password: "secret123",
      verified: true,
      fullName: "Minh An",
    });
    const place = await createPlaceFixture({ ownerId: owner.id, averageRating: 0, ratingCount: 0 });

    const firstRes = await request(app)
      .post(`/api/v1/places/${place.id}/reviews`)
      .set(authHeader(traveler))
      .send({
        rating: 5,
        content: "Địa điểm rất đáng ghé lại.",
      });

    expect(firstRes.status).toBe(201);

    const secondRes = await request(app)
      .post(`/api/v1/places/${place.id}/reviews`)
      .set(authHeader(traveler))
      .send({
        rating: 4,
        content: "Thử gửi trùng lần nữa.",
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body).toEqual({ ok: false, error: "REVIEW_ALREADY_EXISTS" });
  });

  it("owner không thể viết review như traveler", async () => {
    const owner = await createUserFixture({
      email: "owner-cannot-review@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id, averageRating: 0, ratingCount: 0 });

    const res = await request(app)
      .post(`/api/v1/places/${place.id}/reviews`)
      .set(authHeader(owner))
      .send({
        rating: 5,
        content: "Owner không được review chỗ của mình như traveler.",
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: "FORBIDDEN" });
  });

  it("sửa review sẽ xóa reply cũ của owner và cập nhật lại rating thật", async () => {
    const owner = await createUserFixture({
      email: "reply-reset-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
      fullName: "Linh Chủ Quán",
    });
    const traveler = await createUserFixture({
      email: "reply-reset-traveler@example.com",
      password: "secret123",
      verified: true,
      fullName: "Khánh Hà",
    });
    const place = await createPlaceFixture({ ownerId: owner.id, averageRating: 0, ratingCount: 0 });
    const review = await createReviewFixture({
      placeId: place.id,
      userId: traveler.id,
      rating: 5,
      content: "Ban đầu rất hài lòng.",
    });
    await createReviewReplyFixture({
      reviewId: review.id,
      ownerId: owner.id,
      content: "Cảm ơn bạn đã ghé thăm.",
    });

    const updateRes = await request(app)
      .patch(`/api/v1/reviews/${review.id}`)
      .set(authHeader(traveler))
      .send({
        rating: 3,
        content: "Sau khi quay lại, trải nghiệm chỉ còn ở mức ổn.",
        imageUrls: [],
      });

    expect(updateRes.status).toBe(200);

    const myReviewRes = await request(app)
      .get(`/api/v1/places/${place.id}/reviews/me`)
      .set(authHeader(traveler));

    expect(myReviewRes.status).toBe(200);
    expect(myReviewRes.body.data.rating).toBe(3);
    expect(myReviewRes.body.data.ownerReply).toBeNull();

    const placeRes = await request(app).get(`/api/v1/places/${place.id}`);
    expect(placeRes.status).toBe(200);
    expect(placeRes.body.data.rating).toBe(3);
    expect(placeRes.body.data.ratingCount).toBe(1);

    expect(await prisma.reviewReply.count({ where: { reviewId: review.id } })).toBe(0);
  });

  it("đổi tên người dùng sẽ đồng bộ ngay trên danh sách review", async () => {
    const owner = await createUserFixture({
      email: "rename-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "rename-traveler@example.com",
      password: "secret123",
      verified: true,
      fullName: "Ngọc Trâm",
    });
    const place = await createPlaceFixture({ ownerId: owner.id, averageRating: 0, ratingCount: 0 });
    await createReviewFixture({
      placeId: place.id,
      userId: traveler.id,
      rating: 4,
      content: "Điểm đến khá dễ thương.",
    });

    const updateProfileRes = await request(app)
      .patch("/api/v1/users/me")
      .set(authHeader(traveler))
      .send({
        fullName: "Ngọc Trâm Mới",
      });

    expect(updateProfileRes.status).toBe(200);

    const reviewsRes = await request(app)
      .get(`/api/v1/places/${place.id}/reviews`)
      .set(authHeader(traveler));

    expect(reviewsRes.status).toBe(200);
    expect(reviewsRes.body.data[0]?.username).toBe("Ngọc Trâm Mới");
  });
});
