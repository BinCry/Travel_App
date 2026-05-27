import { placeListItemSchema } from "@travel-app/shared/contracts/places";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";

const prismaMock = {
  favorite: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
  place: {
    findUnique: vi.fn(),
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

describe("favorites routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists the current user's favorites", async () => {
    prismaMock.favorite.findMany.mockResolvedValueOnce([
      {
        place: {
          id: "place-1",
          name: "Happy Restaurant",
          region: "Tokyo, Japan",
          category: "DINING",
          averageRating: 4.7,
          ratingCount: 120,
          featureLabel: "Open Now",
          coverImageUrl: "https://cdn.example.com/tokyo.jpg",
        },
      },
    ]);

    const res = await request(app)
      .get("/api/v1/users/me/favorites")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const payload = placeListItemSchema.parse(res.body.data[0]);
    expect(payload.name).toBe("Happy Restaurant");
    expect(payload.category).toBe("dining");
  });

  it("adds a favorite place", async () => {
    prismaMock.place.findUnique.mockResolvedValueOnce({ id: "place-1" });
    prismaMock.favorite.upsert.mockResolvedValueOnce({ userId: 10, placeId: "place-1" });

    const res = await request(app)
      .post("/api/v1/users/me/favorites/places/place-1")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
    expect(prismaMock.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_placeId: { userId: 10, placeId: "place-1" } },
      update: {},
      create: { userId: 10, placeId: "place-1" },
    });
  });

  it("returns not found when favoriting a missing place", async () => {
    prismaMock.place.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/v1/users/me/favorites/places/place-missing")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "PLACE_NOT_FOUND" });
  });

  it("removes a favorite place", async () => {
    prismaMock.favorite.deleteMany.mockResolvedValueOnce({ count: 1 });

    const res = await request(app)
      .delete("/api/v1/users/me/favorites/places/place-1")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(prismaMock.favorite.deleteMany).toHaveBeenCalledWith({
      where: { userId: 10, placeId: "place-1" },
    });
  });
});
