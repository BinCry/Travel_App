import { ownerPlaceSchema, promotionItemSchema } from "@travel-app/shared/contracts/owner";
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
  },
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
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
});
