import { placeDetailSchema, placeListItemSchema } from "@travel-app/shared/contracts/places";
import { reviewListItemSchema } from "@travel-app/shared/contracts/reviews";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";

const prismaMock = {
  place: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  favorite: {
    findUnique: vi.fn(),
  },
  notification: {
    create: vi.fn(),
  },
  review: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `user${userId}@example.com` }, env.jwtSecret);
}

describe("places routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists places with pagination metadata", async () => {
    prismaMock.place.count.mockResolvedValueOnce(1);
    prismaMock.place.findMany.mockResolvedValueOnce([
      {
        id: "place-1",
        name: "Gion District",
        region: "Kyoto, Japan",
        category: "ATTRACTIONS",
        averageRating: 4.9,
        ratingCount: 850,
        featureLabel: "Quiet Now",
        coverImageUrl: "https://cdn.example.com/gion.jpg",
      },
    ]);

    const res = await request(app).get("/api/v1/places?limit=10&offset=5");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.meta).toEqual({ total: 1, limit: 10, offset: 5 });
    const payload = placeListItemSchema.parse(res.body.data[0]);
    expect(payload.location).toBe("Kyoto, Japan");
    expect(payload.category).toBe("attractions");
    expect(payload.ratingCount).toBe(850);
  });

  it("returns place detail with favorite state for authenticated users", async () => {
    prismaMock.place.findUnique.mockResolvedValueOnce({
      id: "place-1",
      name: "Happy Restaurant",
      region: "Tokyo, Japan",
      category: "DINING",
      averageRating: 4.7,
      ratingCount: 120,
      coverImageUrl: "https://cdn.example.com/tokyo.jpg",
      featureLabel: "Open Now",
      about: "Local dining experience in Tokyo.",
      priceLevel: 40,
      updates: [],
      reviews: [
        {
          id: "review-1",
          createdAt: new Date("2024-10-12T00:00:00.000Z"),
          content: "Loved the food.",
          rating: 5,
          user: {
            fullName: "Alex Johnson",
            username: "alex",
            avatarUrl: null,
          },
          images: [{ url: "https://cdn.example.com/review.jpg" }],
        },
      ],
    });
    prismaMock.favorite.findUnique.mockResolvedValueOnce({ userId: 10 });

    const res = await request(app)
      .get("/api/v1/places/place-1")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const payload = placeDetailSchema.parse(res.body.data);
    expect(payload.isFavorite).toBe(true);
    expect(payload.category).toBe("dining");
    expect(payload.reviews).toHaveLength(1);
    expect(payload.reviews[0]?.imageUrls).toEqual(["https://cdn.example.com/review.jpg"]);
  });

  it("returns not found for a missing place detail", async () => {
    prismaMock.place.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get("/api/v1/places/place-missing");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("lists reviews for a place with pagination metadata", async () => {
    prismaMock.place.findUnique.mockResolvedValueOnce({ id: "place-1" });
    prismaMock.review.count.mockResolvedValueOnce(1);
    prismaMock.review.findMany.mockResolvedValueOnce([
      {
        id: "review-1",
        userId: 10,
        rating: 4,
        content: "Great atmosphere.",
        createdAt: new Date("2024-10-10T00:00:00.000Z"),
        user: {
          fullName: "Traveler One",
          username: "traveler1",
          avatarUrl: "https://cdn.example.com/avatar.jpg",
        },
        images: [{ url: "https://cdn.example.com/review-1.jpg" }],
        _count: { likes: 3 },
      },
    ]);

    const res = await request(app).get("/api/v1/places/place-1/reviews?limit=5&offset=0");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.meta).toEqual({ total: 1, limit: 5, offset: 0 });
    const payload = reviewListItemSchema.parse(res.body.data[0]);
    expect(payload.likes).toBe(3);
    expect(payload.username).toBe("Traveler One");
  });

  it("rejects invalid category filters", async () => {
    const res = await request(app).get("/api/v1/places?category=restaurant");

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("VALIDATION");
  });
});
