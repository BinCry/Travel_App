import { reviewLikeToggleSchema, reviewMutationResultSchema } from "@travel-app/shared/contracts/reviews";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";

const transactionMock = {
  reviewImage: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  reviewReply: {
    delete: vi.fn(),
  },
  review: {
    update: vi.fn(),
  },
};

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  place: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  review: {
    aggregate: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  reviewLike: {
    findFirst: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

const { default: app } = await import("../../src/app.js");

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, email: `user${userId}@example.com` }, env.jwtSecret);
}

describe("review routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findUnique.mockResolvedValue({
      id: 10,
      role: "TRAVELER",
    });
    prismaMock.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: 2,
    });
    prismaMock.place.update.mockResolvedValue({
      id: "place-1",
    });
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof transactionMock) => Promise<unknown>) =>
      callback(transactionMock)
    );
    transactionMock.reviewImage.deleteMany.mockResolvedValue({ count: 0 });
    transactionMock.reviewImage.createMany.mockResolvedValue({ count: 0 });
    transactionMock.reviewReply.delete.mockResolvedValue({ id: "reply-1" });
    transactionMock.review.update.mockResolvedValue({ id: "review-1" });
  });

  it("creates a review for an existing place", async () => {
    prismaMock.place.findUnique.mockResolvedValueOnce({ id: "place-1" });
    prismaMock.review.create.mockResolvedValueOnce({
      id: "review-1",
      placeId: "place-1",
      userId: 10,
    });

    const res = await request(app)
      .post("/api/v1/places/place-1/reviews")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        rating: 5,
        content: "Excellent trip.",
        imageUrls: ["https://cdn.example.com/review-1.jpg"],
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    const payload = reviewMutationResultSchema.parse(res.body.data);
    expect(payload.id).toBe("review-1");
    expect(prismaMock.review.create).toHaveBeenCalled();
    expect(prismaMock.place.update).toHaveBeenCalled();
  });

  it("rejects invalid review payloads", async () => {
    const res = await request(app)
      .post("/api/v1/places/place-1/reviews")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        rating: 0,
        content: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("VALIDATION");
    expect(prismaMock.place.findUnique).not.toHaveBeenCalled();
  });

  it("forbids updating someone else's review", async () => {
    prismaMock.review.findUnique.mockResolvedValueOnce({
      id: "review-1",
      placeId: "place-1",
      userId: 99,
    });

    const res = await request(app)
      .patch("/api/v1/reviews/review-1")
      .set("Authorization", `Bearer ${makeToken(10)}`)
      .send({
        content: "Edited content",
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: "FORBIDDEN" });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns not found when deleting a missing review", async () => {
    prismaMock.review.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .delete("/api/v1/reviews/review-missing")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "REVIEW_NOT_FOUND" });
    expect(prismaMock.review.delete).not.toHaveBeenCalled();
  });

  it("toggles a review like on", async () => {
    prismaMock.review.findUnique.mockResolvedValueOnce({
      id: "review-1",
      userId: 2,
    });
    prismaMock.reviewLike.findFirst.mockResolvedValueOnce(null);
    prismaMock.reviewLike.create.mockResolvedValueOnce({ id: 1 });
    prismaMock.reviewLike.count.mockResolvedValueOnce(4);

    const res = await request(app)
      .post("/api/v1/reviews/review-1/likes/toggle")
      .set("Authorization", `Bearer ${makeToken(10)}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const payload = reviewLikeToggleSchema.parse(res.body.data);
    expect(payload).toEqual({ liked: true, likes: 4 });
  });
});
