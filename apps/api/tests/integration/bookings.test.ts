import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bookingOptionSchema,
  travelerBookingSchema,
} from "@travel-app/shared/contracts/bookings";
import { env } from "../../src/config/env.js";

const bookingsServiceMock = {
  listPlaceAvailability: vi.fn(),
  listMine: vi.fn(),
  create: vi.fn(),
  cancel: vi.fn(),
};

vi.mock("../../src/services/bookings.service.js", () => ({
  bookingsService: bookingsServiceMock,
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `traveler${userId}@example.com` }, env.jwtSecret);
}

describe("booking routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth for creating bookings", async () => {
    const res = await request(app).post("/api/v1/bookings").send({
      slotId: "slot-1",
      partySize: 2,
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "UNAUTHORIZED" });
  });

  it("lists public availability for a place", async () => {
    bookingsServiceMock.listPlaceAvailability.mockResolvedValueOnce([
      {
        id: "option-1",
        placeId: "place-1",
        title: "Ban toi cho 2 nguoi",
        description: "View dep",
        priceLabel: "350.000đ / bàn",
        durationMinutes: 90,
        maxPartySize: 2,
        isActive: true,
        slots: [
          {
            id: "slot-1",
            optionId: "option-1",
            startAt: "2026-06-15T11:00:00.000Z",
            endAt: "2026-06-15T12:30:00.000Z",
            dateLabel: "15/06/2026",
            timeLabel: "18:00 - 19:30",
            capacity: 6,
            remainingCapacity: 4,
            isActive: true,
            isBookable: true,
          },
        ],
      },
    ]);

    const res = await request(app)
      .get("/api/v1/bookings/places/place-1/options")
      .set("Authorization", `Bearer ${makeToken(12)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const [payload] = res.body.data.map((item: unknown) => bookingOptionSchema.parse(item));
    expect(payload.slots[0]?.remainingCapacity).toBe(4);
  });

  it("creates a booking and returns the normalized payload", async () => {
    bookingsServiceMock.create.mockResolvedValueOnce({
      id: "booking-1",
      placeId: "place-1",
      placeName: "Happy Restaurant",
      placeImageUrl: "https://cdn.example.com/place.jpg",
      optionId: "option-1",
      optionTitle: "Ban toi cho 2 nguoi",
      slotId: "slot-1",
      slotDateLabel: "15/06/2026",
      slotTimeLabel: "18:00 - 19:30",
      slotStartAt: "2026-06-15T11:00:00.000Z",
      slotEndAt: "2026-06-15T12:30:00.000Z",
      partySize: 2,
      note: "Ban gan cua so",
      status: "PENDING",
      createdAt: "2026-05-29T11:00:00.000Z",
      updatedAt: "2026-05-29T11:00:00.000Z",
      canCancel: true,
    });

    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${makeToken(12)}`)
      .send({
        slotId: "slot-1",
        partySize: 2,
        note: "Ban gan cua so",
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    const payload = travelerBookingSchema.parse(res.body.data);
    expect(payload.status).toBe("PENDING");
    expect(bookingsServiceMock.create).toHaveBeenCalledWith(12, expect.any(Object));
  });
});
