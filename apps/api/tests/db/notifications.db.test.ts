import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createAvailabilitySlotFixture,
  createBookingFixture,
  createBookingOptionFixture,
  createPlaceFixture,
  createReviewFixture,
  createUserFixture,
  resetDatabase,
} from "./helpers/testDb.js";

const { default: app } = await import("../../src/app.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db notifications", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("traveler receives a notification when owner replies to a review", async () => {
    const owner = await createUserFixture({
      email: "notifications-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "notifications-traveler@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id, name: "Lantern Cafe" });
    const review = await createReviewFixture({
      placeId: place.id,
      userId: traveler.id,
      content: "Rat thich khong gian tai day.",
    });

    await request(app)
      .put(`/api/v1/owner/reviews/${review.id}/reply`)
      .set(authHeader(owner))
      .send({ content: "Cam on ban da ghe tham." })
      .expect(200);

    const notificationsRes = await request(app)
      .get("/api/v1/notifications")
      .set(authHeader(traveler));

    expect(notificationsRes.status).toBe(200);
    expect(notificationsRes.body.data[0]?.type).toBe("review_reply");
    expect(notificationsRes.body.data[0]?.message).toContain("Lantern Cafe");

    const notificationId = notificationsRes.body.data[0]?.id as string;

    const markReadRes = await request(app)
      .post(`/api/v1/notifications/${notificationId}/read`)
      .set(authHeader(traveler));

    expect(markReadRes.status).toBe(200);
    expect(markReadRes.body.data.readAt).toBeTruthy();
  });

  it("traveler receives booking and place update notifications tied to owner actions", async () => {
    const owner = await createUserFixture({
      email: "notifications-owner-2@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "notifications-traveler-2@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id, name: "Happy Restaurant" });
    const option = await createBookingOptionFixture({ placeId: place.id });
    const slot = await createAvailabilitySlotFixture({ optionId: option.id });
    const booking = await createBookingFixture({
      placeId: place.id,
      optionId: option.id,
      slotId: slot.id,
      travelerId: traveler.id,
      status: "PENDING",
    });

    await request(app)
      .post(`/api/v1/users/me/favorites/places/${place.id}`)
      .set(authHeader(traveler))
      .expect(201);

    await request(app)
      .patch(`/api/v1/owner/bookings/${booking.id}/status`)
      .set(authHeader(owner))
      .send({ status: "CONFIRMED" })
      .expect(200);

    await request(app)
      .post(`/api/v1/owner/places/${place.id}/updates`)
      .set(authHeader(owner))
      .send({
        title: "Khung gio toi dep nhat",
        content: "Ban nen ghe trong khoang 18:00 - 19:00 de co trai nghiem dep nhat.",
      })
      .expect(201);

    const notificationsRes = await request(app)
      .get("/api/v1/notifications")
      .set(authHeader(traveler));

    expect(notificationsRes.status).toBe(200);
    const types = notificationsRes.body.data.map((item: { type: string }) => item.type);
    expect(types).toContain("booking_status");
    expect(types).toContain("place_update");
  });
});
