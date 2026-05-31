import { ownerPlaceSchema, promotionItemSchema } from "@travel-app/shared/contracts/owner";
import {
  ownerPlaceReviewSchema,
  ownerReviewReplySchema,
} from "@travel-app/shared/contracts/reviews";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  place: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  promotion: {
    createMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
  },
  review: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  reviewReply: {
    upsert: vi.fn(),
    delete: vi.fn(),
  },
  notification: {
    create: vi.fn(),
    createMany: vi.fn(),
  },
  favorite: {
    count: vi.fn(),
  },
};

const bookingsServiceMock = {
  listOwnerOptions: vi.fn(),
  createOwnerOption: vi.fn(),
  updateOwnerOption: vi.fn(),
  deleteOwnerOption: vi.fn(),
  createOwnerSlot: vi.fn(),
  updateOwnerSlot: vi.fn(),
  deleteOwnerSlot: vi.fn(),
  listOwnerBookings: vi.fn(),
  updateOwnerBookingStatus: vi.fn(),
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../src/services/bookings.service.js", () => ({
  bookingsService: bookingsServiceMock,
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `owner${userId}@example.com` }, env.jwtSecret);
}

describe("owner routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks non-owner access", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "TRAVELER" });

    const res = await request(app)
      .get("/api/v1/owner/places")
      .set("Authorization", `Bearer ${makeToken(21)}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: "FORBIDDEN" });
  });

  it("creates a place for an owner", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    prismaMock.place.create.mockResolvedValueOnce({
      id: "place-1",
      name: "Lantern Cafe",
      region: "Hoi An",
      coverImageUrl: "https://cdn.example.com/place-1.jpg",
    });
    prismaMock.promotion.createMany.mockResolvedValueOnce({ count: 1 });

    const res = await request(app)
      .post("/api/v1/owner/places")
      .set("Authorization", `Bearer ${makeToken(21)}`)
      .send({
        name: "Lantern Cafe",
        region: "Hoi An",
        category: "dining",
        about: "Quiet place for coffee.",
        coverImageUrl: "https://cdn.example.com/place-1.jpg",
        promotions: [
          {
            title: "Morning Set",
            schedule: {
              startDate: "2026-05-26",
              endDate: "2026-05-30",
              days: ["M", "T"],
              startTime: "08:00",
              endTime: "10:00",
              specificTime: true,
            },
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    const payload = ownerPlaceSchema.parse(res.body.data);
    expect(payload.name).toBe("Lantern Cafe");
    expect(payload.location).toBe("Hoi An");
    expect(prismaMock.promotion.createMany).toHaveBeenCalledTimes(1);
  });

  it("validates promotion creation payloads", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    prismaMock.place.findFirst.mockResolvedValueOnce({ id: "place-1", ownerId: 21 });

    const res = await request(app)
      .post("/api/v1/owner/places/place-1/promotions")
      .set("Authorization", `Bearer ${makeToken(21)}`)
      .send({
        title: "",
        schedule: {
          startDate: "",
          endDate: "",
          days: [],
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("VALIDATION");
    expect(prismaMock.promotion.create).not.toHaveBeenCalled();
  });

  it("toggles a promotion for an owner", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    prismaMock.promotion.findUnique = vi.fn().mockResolvedValueOnce({
      id: "promo-1",
      isActive: false,
      place: { ownerId: 21 },
    });
    prismaMock.promotion.update = vi.fn().mockResolvedValueOnce({
      id: "promo-1",
      title: "Night Deal",
      isActive: true,
      startDate: "2026-05-26",
      endDate: "2026-05-26",
      days: ["F"],
      startTime: "",
      endTime: "",
      specificTime: false,
    });

    const res = await request(app)
      .post("/api/v1/owner/promotions/promo-1/toggle")
      .set("Authorization", `Bearer ${makeToken(21)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const payload = promotionItemSchema.parse(res.body.data);
    expect(payload.isActive).toBe(true);
  });

  it("lists reviews for an owned place", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    prismaMock.place.findFirst.mockResolvedValueOnce({ id: "place-1", ownerId: 21 });
    prismaMock.review.findMany.mockResolvedValueOnce([
      {
        id: "review-1",
        rating: 5,
        content: "Wonderful place",
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        user: {
          fullName: "Alex Johnson",
          username: "alex_love_travel",
          avatarUrl: "https://cdn.example.com/avatar.jpg",
        },
        images: [{ url: "https://cdn.example.com/review.jpg" }],
        _count: { likes: 4 },
        reply: {
          id: "reply-1",
          content: "Thank you for visiting.",
          createdAt: new Date("2026-05-29T10:00:00.000Z"),
          owner: { fullName: "Minh Hoàng", username: "minh_host" },
        },
      },
    ]);

    const res = await request(app)
      .get("/api/v1/owner/places/place-1/reviews")
      .set("Authorization", `Bearer ${makeToken(21)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const [payload] = res.body.data.map((item: unknown) => ownerPlaceReviewSchema.parse(item));
    expect(payload.ownerReply?.content).toBe("Thank you for visiting.");
  });

  it("upserts a reply for a review owned by the current owner", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    prismaMock.review.findUnique.mockResolvedValueOnce({
      id: "review-1",
      place: { id: "place-1", ownerId: 21, name: "Lantern Cafe" },
      user: { id: 12 },
      reply: null,
    });
    prismaMock.reviewReply.upsert.mockResolvedValueOnce({
      id: "reply-1",
      content: "Cảm ơn bạn đã đánh giá.",
      createdAt: new Date("2026-05-29T10:00:00.000Z"),
      owner: { fullName: "Minh Hoàng", username: "minh_host" },
    });

    const res = await request(app)
      .put("/api/v1/owner/reviews/review-1/reply")
      .set("Authorization", `Bearer ${makeToken(21)}`)
      .send({ content: "Cảm ơn bạn đã đánh giá." });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const payload = ownerReviewReplySchema.parse(res.body.data);
    expect(payload.content).toBe("Cảm ơn bạn đã đánh giá.");
  });

  it("returns analytics summary for the owner dashboard", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    prismaMock.place.findMany.mockResolvedValueOnce([
      {
        id: "place-1",
        name: "Lantern Cafe",
        averageRating: 4.8,
        ratingCount: 10,
        _count: {
          reviews: 2,
          favorites: 5,
          promotions: 1,
          bookings: 3,
        },
      },
    ]);
    prismaMock.promotion.count.mockResolvedValueOnce(1);
    prismaMock.booking.findMany.mockResolvedValueOnce([
      { status: "PENDING", placeId: "place-1" },
      { status: "CONFIRMED", placeId: "place-1" },
      { status: "COMPLETED", placeId: "place-1" },
    ]);
    prismaMock.review.count.mockResolvedValueOnce(2);
    prismaMock.favorite.count.mockResolvedValueOnce(5);

    const res = await request(app)
      .get("/api/v1/owner/analytics/summary")
      .set("Authorization", `Bearer ${makeToken(21)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.placeCount).toBe(1);
    expect(res.body.data.totalBookingCount).toBe(3);
    expect(res.body.data.topPlaces[0]?.placeName).toBe("Lantern Cafe");
  });

  it("lists booking options for an owned place", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    bookingsServiceMock.listOwnerOptions.mockResolvedValueOnce([
      {
        id: "option-1",
        placeId: "place-1",
        title: "Bàn tối cho 2 người",
        description: "View dep",
        priceLabel: "350.000đ / bàn",
        durationMinutes: 90,
        maxPartySize: 2,
        isActive: true,
        slots: [],
      },
    ]);

    const res = await request(app)
      .get("/api/v1/owner/places/place-1/booking-options")
      .set("Authorization", `Bearer ${makeToken(21)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data[0]?.title).toBe("Bàn tối cho 2 người");
  });

  it("updates booking status for an owned place", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    bookingsServiceMock.updateOwnerBookingStatus.mockResolvedValueOnce({
      id: "booking-1",
      placeId: "place-1",
      placeName: "Happy Restaurant",
      placeImageUrl: "https://cdn.example.com/place.jpg",
      optionId: "option-1",
      optionTitle: "Bàn tối cho 2 người",
      slotId: "slot-1",
      slotDateLabel: "15/06/2026",
      slotTimeLabel: "18:00 - 19:30",
      slotStartAt: "2026-06-15T11:00:00.000Z",
      slotEndAt: "2026-06-15T12:30:00.000Z",
      partySize: 2,
      note: "Bàn gần cửa sổ",
      status: "CONFIRMED",
      createdAt: "2026-05-29T11:00:00.000Z",
      updatedAt: "2026-05-29T11:10:00.000Z",
      canCancel: true,
      travelerName: "Alex Johnson",
      travelerEmail: "alex@example.com",
    });

    const res = await request(app)
      .patch("/api/v1/owner/bookings/booking-1/status")
      .set("Authorization", `Bearer ${makeToken(21)}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(bookingsServiceMock.updateOwnerBookingStatus).toHaveBeenCalledWith(
      21,
      "booking-1",
      expect.any(Object)
    );
  });
});
