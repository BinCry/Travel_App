import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authHeader,
  createPlaceFixture,
  createUserFixture,
  resetDatabase,
} from "./helpers/testDb.js";

const { default: app } = await import("../../src/app.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db collections", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitState();
  });

  it("traveler can create a collection, save a place, update it, and remove the place", async () => {
    const traveler = await createUserFixture({
      email: "collections-traveler@example.com",
      password: "secret123",
      verified: true,
    });
    const owner = await createUserFixture({
      email: "collections-owner@example.com",
      password: "secret123",
      role: "OWNER",
      verified: true,
    });
    const place = await createPlaceFixture({ ownerId: owner.id, name: "Lantern Cafe" });

    const createRes = await request(app)
      .post("/api/v1/collections")
      .set(authHeader(traveler))
      .send({
        title: "Wishlist cuoi tuan",
        isPublic: false,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.title).toBe("Wishlist cuoi tuan");
    const collectionId = createRes.body.data.id as string;

    await request(app)
      .post(`/api/v1/collections/${collectionId}/places`)
      .set(authHeader(traveler))
      .send({ placeId: place.id })
      .expect(201);

    const listRes = await request(app)
      .get(`/api/v1/collections?placeId=${place.id}`)
      .set(authHeader(traveler));

    expect(listRes.status).toBe(200);
    expect(listRes.body.data[0]?.containsPlace).toBe(true);

    const detailRes = await request(app)
      .get(`/api/v1/collections/${collectionId}`)
      .set(authHeader(traveler));

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.placeCount).toBe(1);
    expect(detailRes.body.data.places[0]?.name).toBe("Lantern Cafe");

    const updateRes = await request(app)
      .patch(`/api/v1/collections/${collectionId}`)
      .set(authHeader(traveler))
      .send({
        title: "Wishlist cong khai",
        isPublic: true,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe("Wishlist cong khai");
    expect(updateRes.body.data.isPublic).toBe(true);

    await request(app)
      .delete(`/api/v1/collections/${collectionId}/places/${place.id}`)
      .set(authHeader(traveler))
      .expect(200);

    const emptyDetailRes = await request(app)
      .get(`/api/v1/collections/${collectionId}`)
      .set(authHeader(traveler));

    expect(emptyDetailRes.status).toBe(200);
    expect(emptyDetailRes.body.data.placeCount).toBe(0);
    expect(emptyDetailRes.body.data.places).toHaveLength(0);
  });

  it("user cannot access another user's collection", async () => {
    const ownerCollectionUser = await createUserFixture({
      email: "collections-owner-user@example.com",
      password: "secret123",
      verified: true,
    });
    const stranger = await createUserFixture({
      email: "collections-stranger@example.com",
      password: "secret123",
      verified: true,
    });

    const createRes = await request(app)
      .post("/api/v1/collections")
      .set(authHeader(ownerCollectionUser))
      .send({
        title: "Danh sach rieng",
      });

    const collectionId = createRes.body.data.id as string;

    const res = await request(app)
      .get(`/api/v1/collections/${collectionId}`)
      .set(authHeader(stranger));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "COLLECTION_NOT_FOUND" });
  });
});
