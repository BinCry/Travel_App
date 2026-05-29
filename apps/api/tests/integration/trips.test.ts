import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tripDetailSchema, tripListItemSchema } from "@travel-app/shared/contracts/trips";
import { env } from "../../src/config/env.js";

const tripsServiceMock = {
  list: vi.fn(),
  create: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  duplicate: vi.fn(),
  createStop: vi.fn(),
  updateStop: vi.fn(),
  removeStop: vi.fn(),
};

vi.mock("../../src/services/trips.service.js", () => ({
  tripsService: tripsServiceMock,
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `traveler${userId}@example.com` }, env.jwtSecret);
}

describe("trip routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth for listing trips", async () => {
    const res = await request(app).get("/api/v1/trips");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "UNAUTHORIZED" });
  });

  it("creates a trip and returns the detail payload", async () => {
    tripsServiceMock.create.mockResolvedValueOnce({
      id: "trip-1",
      title: "Kyoto chill",
      destination: "Kyoto, Japan",
      startDate: "2026-06-12",
      endDate: "2026-06-14",
      budget: "balanced",
      notes: "Slow travel only",
      stopCount: 1,
      dayCount: 1,
      updatedAt: "2026-05-29T10:30:00.000Z",
      stops: [
        {
          id: "stop-1",
          dayNumber: 1,
          orderIndex: 1,
          title: "Walk around Gion",
          location: "Kyoto",
          note: "Golden hour",
          startTime: "16:30",
          endTime: "18:00",
        },
      ],
    });

    const res = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${makeToken(22)}`)
      .send({
        title: "Kyoto chill",
        destination: "Kyoto, Japan",
        startDate: "2026-06-12",
        endDate: "2026-06-14",
        budget: "balanced",
        notes: "Slow travel only",
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    const payload = tripDetailSchema.parse(res.body.data);
    expect(payload.stops).toHaveLength(1);
    expect(tripsServiceMock.create).toHaveBeenCalledWith(22, expect.any(Object));
  });

  it("lists paginated trips", async () => {
    tripsServiceMock.list.mockResolvedValueOnce({
      items: [
        {
          id: "trip-1",
          title: "Kyoto chill",
          destination: "Kyoto",
          startDate: "2026-06-12",
          endDate: "2026-06-14",
          budget: "balanced",
          notes: null,
          stopCount: 3,
          dayCount: 2,
          updatedAt: "2026-05-29T10:30:00.000Z",
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });

    const res = await request(app)
      .get("/api/v1/trips?limit=20&offset=0")
      .set("Authorization", `Bearer ${makeToken(22)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const [payload] = res.body.data.map((item: unknown) => tripListItemSchema.parse(item));
    expect(payload.stopCount).toBe(3);
    expect(res.body.meta).toEqual({ total: 1, limit: 20, offset: 0 });
  });
});
