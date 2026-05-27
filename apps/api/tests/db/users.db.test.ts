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
const { prisma } = await import("../../src/database/client.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db user account flows", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("đổi mật khẩu báo lỗi khi nhập sai mật khẩu hiện tại", async () => {
    const user = await createUserFixture({
      email: "change-password@example.com",
      password: "secret123",
      verified: true,
    });

    const res = await request(app)
      .post("/api/v1/users/me/change-password")
      .set(authHeader(user))
      .send({
        currentPassword: "wrong-password",
        newPassword: "newSecret123",
      });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "INVALID_CREDENTIALS" });
  });

  it("xóa traveler sẽ xóa luôn review và địa điểm đã lưu của chính họ", async () => {
    const traveler = await createUserFixture({
      email: "traveler-delete@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture();

    await prisma.favorite.create({
      data: {
        userId: traveler.id,
        placeId: place.id,
      },
    });
    await prisma.review.create({
      data: {
        placeId: place.id,
        userId: traveler.id,
        rating: 5,
        content: "Rất đáng trải nghiệm",
      },
    });

    const res = await request(app)
      .post("/api/v1/users/me/delete")
      .set(authHeader(traveler))
      .send({
        currentPassword: "secret123",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain("xóa vĩnh viễn");

    expect(await prisma.user.findUnique({ where: { id: traveler.id } })).toBeNull();
    expect(await prisma.favorite.count({ where: { userId: traveler.id } })).toBe(0);
    expect(await prisma.review.count({ where: { userId: traveler.id } })).toBe(0);
  });

  it("xóa owner sẽ xóa luôn địa điểm và ưu đãi do owner đó sở hữu", async () => {
    const owner = await createUserFixture({
      email: "owner-delete@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id });
    const promotion = await createPromotionFixture(place.id);

    const res = await request(app)
      .post("/api/v1/users/me/delete")
      .set(authHeader(owner))
      .send({
        currentPassword: "secret123",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain("địa điểm");

    expect(await prisma.user.findUnique({ where: { id: owner.id } })).toBeNull();
    expect(await prisma.place.findUnique({ where: { id: place.id } })).toBeNull();
    expect(await prisma.promotion.findUnique({ where: { id: promotion.id } })).toBeNull();
  });
});
