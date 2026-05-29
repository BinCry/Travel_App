import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createTripFixture,
  createTripStopFixture,
  createUserFixture,
  resetDatabase,
} from "./helpers/testDb.js";

const { default: app } = await import("../../src/app.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db trips", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("traveler can create a trip and insert a stop at a specific position", async () => {
    const traveler = await createUserFixture({
      email: "trip-traveler@example.com",
      password: "secret123",
      verified: true,
    });

    const createRes = await request(app)
      .post("/api/v1/trips")
      .set(authHeader(traveler))
      .send({
        title: "Kyoto chill",
        destination: "Kyoto, Japan",
        startDate: "2026-06-12",
        endDate: "2026-06-14",
        budget: "balanced",
        notes: "Slow travel only",
      });

    expect(createRes.status).toBe(201);
    const tripId = createRes.body.data.id as string;

    await request(app)
      .post(`/api/v1/trips/${tripId}/stops`)
      .set(authHeader(traveler))
      .send({
        dayNumber: 1,
        title: "Dinner",
        location: "Kyoto downtown",
      })
      .expect(201);

    const insertRes = await request(app)
      .post(`/api/v1/trips/${tripId}/stops`)
      .set(authHeader(traveler))
      .send({
        dayNumber: 1,
        title: "Check-in hotel",
        orderIndex: 1,
        location: "Kyoto station",
      });

    expect(insertRes.status).toBe(201);
    expect(insertRes.body.data.stops.map((stop: { title: string }) => stop.title)).toEqual([
      "Check-in hotel",
      "Dinner",
    ]);
  });

  it("traveler cannot read another user's trip", async () => {
    const owner = await createUserFixture({
      email: "trip-owner-a@example.com",
      password: "secret123",
      verified: true,
    });
    const stranger = await createUserFixture({
      email: "trip-owner-b@example.com",
      password: "secret123",
      verified: true,
    });
    const trip = await createTripFixture({ userId: owner.id });

    const res = await request(app)
      .get(`/api/v1/trips/${trip.id}`)
      .set(authHeader(stranger));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "TRIP_NOT_FOUND" });
  });

  it("reorders an existing stop inside the same day", async () => {
    const traveler = await createUserFixture({
      email: "trip-reorder@example.com",
      password: "secret123",
      verified: true,
    });
    const trip = await createTripFixture({ userId: traveler.id });
    const firstStop = await createTripStopFixture(trip.id, {
      dayNumber: 1,
      orderIndex: 1,
      title: "Breakfast",
    });
    const secondStop = await createTripStopFixture(trip.id, {
      dayNumber: 1,
      orderIndex: 2,
      title: "Temple visit",
    });

    const res = await request(app)
      .patch(`/api/v1/trips/${trip.id}/stops/${secondStop.id}`)
      .set(authHeader(traveler))
      .send({
        dayNumber: 1,
        orderIndex: 1,
      });

    expect(res.status).toBe(200);
    expect(
      res.body.data.stops.map((stop: { id: string; title: string; orderIndex: number }) => ({
        id: stop.id,
        title: stop.title,
        orderIndex: stop.orderIndex,
      }))
    ).toEqual([
      { id: secondStop.id, title: "Temple visit", orderIndex: 1 },
      { id: firstStop.id, title: "Breakfast", orderIndex: 2 },
    ]);
  });
});
