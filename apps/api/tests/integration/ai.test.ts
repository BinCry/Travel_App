import { tripPlanResponseSchema } from "@travel-app/shared/contracts/ai";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";
import { resetRateLimitState } from "../../src/middleware/rateLimit.js";

const geminiMock = {
  generateTripPlanContent: vi.fn(),
};

vi.mock("../../src/database/client.js", () => ({
  prisma: {},
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../src/integrations/gemini.js", () => geminiMock);

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `user${userId}@example.com` }, env.jwtSecret);
}

describe("ai routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitState();
  });

  it("requires authentication for trip planning", async () => {
    const res = await request(app).post("/api/v1/ai/trip-plan").send({
      query: "one day plan",
      location: "Da Nang",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "UNAUTHORIZED" });
  });

  it("returns a Gemini-backed trip plan for authenticated users", async () => {
    geminiMock.generateTripPlanContent.mockResolvedValueOnce({
      location: "Hue",
      note: "Generated with Gemini.",
      suggestions: [
        {
          title: "Morning coffee walk",
          description: "Start with riverside cafes and light sightseeing.",
          duration: "2 hours",
        },
        {
          title: "Historic quarter",
          description: "Visit the main heritage highlights after lunch.",
          duration: "4 hours",
        },
        {
          title: "Sunset food stop",
          description: "Finish with local specialties and a sunset view.",
          duration: "2 hours",
        },
      ],
    });

    const res = await request(app)
      .post("/api/v1/ai/trip-plan")
      .set("Authorization", `Bearer ${makeToken(7)}`)
      .send({
        query: "coffee and museums",
        location: "Hue",
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const payload = tripPlanResponseSchema.parse(res.body.data);
    expect(payload.location).toBe("Hue");
    expect(payload.suggestions).toHaveLength(3);
    expect(geminiMock.generateTripPlanContent).toHaveBeenCalledTimes(1);
  });

  it("maps provider outages to AI_UNAVAILABLE", async () => {
    geminiMock.generateTripPlanContent.mockRejectedValueOnce(
      Object.assign(new Error("AI_UNAVAILABLE"), { statusCode: 503 })
    );

    const res = await request(app)
      .post("/api/v1/ai/trip-plan")
      .set("Authorization", `Bearer ${makeToken(7)}`)
      .send({
        query: "coffee and museums",
        location: "Hue",
      });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ ok: false, error: "AI_UNAVAILABLE" });
  });

  it("maps provider rate limits to AI_RATE_LIMITED", async () => {
    geminiMock.generateTripPlanContent.mockRejectedValueOnce(
      Object.assign(new Error("AI_RATE_LIMITED"), { statusCode: 429 })
    );

    const res = await request(app)
      .post("/api/v1/ai/trip-plan")
      .set("Authorization", `Bearer ${makeToken(7)}`)
      .send({
        query: "coffee and museums",
        location: "Hue",
      });

    expect(res.status).toBe(429);
    expect(res.body).toEqual({ ok: false, error: "AI_RATE_LIMITED" });
  });

  it("rate limits repeated trip plan requests", async () => {
    geminiMock.generateTripPlanContent.mockResolvedValue({
      location: "Da Nang",
      note: "Generated with Gemini.",
      suggestions: [
        {
          title: "Morning",
          description: "Start by the beach.",
          duration: "2 hours",
        },
        {
          title: "Afternoon",
          description: "Explore dining spots.",
          duration: "3 hours",
        },
        {
          title: "Evening",
          description: "Enjoy city lights.",
          duration: "2 hours",
        },
      ],
    });

    for (let index = 0; index < 6; index += 1) {
      const response = await request(app)
        .post("/api/v1/ai/trip-plan")
        .set("Authorization", `Bearer ${makeToken(7)}`)
        .send({
          query: "food weekend",
          location: "Da Nang",
        });

      expect(response.status).toBe(200);
    }

    const blocked = await request(app)
      .post("/api/v1/ai/trip-plan")
      .set("Authorization", `Bearer ${makeToken(7)}`)
      .send({
        query: "food weekend",
        location: "Da Nang",
      });

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ ok: false, error: "RATE_LIMITED" });
    expect(geminiMock.generateTripPlanContent).toHaveBeenCalledTimes(6);
  });

  it("validates trip plan requests", async () => {
    const res = await request(app)
      .post("/api/v1/ai/trip-plan")
      .set("Authorization", `Bearer ${makeToken(7)}`)
      .send({
        query: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("VALIDATION");
  });
});
