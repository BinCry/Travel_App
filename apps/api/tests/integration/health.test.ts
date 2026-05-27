import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/database/client.js", () => ({
  prisma: {},
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../src/services/storage.service.js", () => ({
  storageService: {
    getStatus: vi.fn().mockResolvedValue({
      driver: "local",
      publicBaseUrl: "http://localhost:8000",
      publicBaseUrlConfigured: true,
      uploadsDir: "uploads",
      writable: true,
    }),
  },
}));

const { default: app } = await import("../../src/app.js");

describe("GET /health", () => {
  it("returns writable local storage and database status", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.database.connected).toBe(true);
    expect(res.body.storage.driver).toBe("local");
    expect(typeof res.body.storage.writable).toBe("boolean");
  });
});

describe("GET /openapi.json", () => {
  it("returns generated OpenAPI document", async () => {
    const res = await request(app).get("/openapi.json").expect(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.paths).toBeDefined();
    expect(res.body.paths["/api/v1/ai/trip-plan"]).toBeDefined();
    expect(res.body.paths["/api/v1/owner/places"]).toBeDefined();
    expect(res.body.paths["/api/v1/auth/oauth/{provider}"]).toBeUndefined();
  });
});
