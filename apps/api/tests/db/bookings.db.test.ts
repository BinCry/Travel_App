import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createAvailabilitySlotFixture,
  createBookingFixture,
  createBookingOptionFixture,
  createPlaceFixture,
  createUserFixture,
  resetDatabase,
} from "./helpers/testDb.js";

const { default: app } = await import("../../src/app.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db bookings flows", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("traveler co the tao va huy booking cua minh", async () => {
    const owner = await createUserFixture({
      email: "booking-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "booking-traveler@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id, name: "Happy Restaurant" });
    const option = await createBookingOptionFixture({ placeId: place.id });
    const slot = await createAvailabilitySlotFixture({ optionId: option.id });

    const createRes = await request(app)
      .post("/api/v1/bookings")
      .set(authHeader(traveler))
      .send({
        slotId: slot.id,
        partySize: 2,
        note: "Bàn gần cửa sổ",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe("PENDING");

    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${createRes.body.data.id}/cancel`)
      .set(authHeader(traveler));

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe("CANCELLED");
  });

  it("khong cho phep overbook khi slot da het cho", async () => {
    const owner = await createUserFixture({
      email: "slot-full-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const travelerA = await createUserFixture({
      email: "slot-full-a@example.com",
      password: "secret123",
      verified: true,
    });
    const travelerB = await createUserFixture({
      email: "slot-full-b@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id });
    const option = await createBookingOptionFixture({
      placeId: place.id,
      maxPartySize: 4,
    });
    const slot = await createAvailabilitySlotFixture({
      optionId: option.id,
      capacity: 2,
    });

    await createBookingFixture({
      placeId: place.id,
      optionId: option.id,
      slotId: slot.id,
      travelerId: travelerA.id,
      partySize: 2,
      status: "CONFIRMED",
    });

    const res = await request(app)
      .post("/api/v1/bookings")
      .set(authHeader(travelerB))
      .send({
        slotId: slot.id,
        partySize: 1,
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ ok: false, error: "BOOKING_SLOT_FULL" });
  });

  it("owner khong the cap nhat booking cua dia diem owner khac", async () => {
    const ownerA = await createUserFixture({
      email: "owner-booking-a@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const ownerB = await createUserFixture({
      email: "owner-booking-b@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const traveler = await createUserFixture({
      email: "owner-booking-traveler@example.com",
      password: "secret123",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: ownerA.id });
    const option = await createBookingOptionFixture({ placeId: place.id });
    const slot = await createAvailabilitySlotFixture({ optionId: option.id });
    const booking = await createBookingFixture({
      placeId: place.id,
      optionId: option.id,
      slotId: slot.id,
      travelerId: traveler.id,
      status: "PENDING",
    });

    const res = await request(app)
      .patch(`/api/v1/owner/bookings/${booking.id}/status`)
      .set(authHeader(ownerB))
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "BOOKING_NOT_FOUND" });
  });
});
