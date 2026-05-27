import type {
  ReviewLikeToggleResponse,
  ReviewListItem,
  ReviewMutationResult,
  UserReviewListItem,
} from "@travel-app/shared/contracts/reviews";
import {
  reviewCreateRequestSchema,
  reviewLikeToggleSchema,
  reviewListItemSchema,
  reviewMutationResultSchema,
  reviewUpdateRequestSchema,
  userReviewListItemSchema,
} from "@travel-app/shared/contracts/reviews";
import { prisma } from "../database/client.js";
import type { Pagination } from "../http/pagination.js";

async function recalcPlaceStats(placeId: string) {
  const agg = await prisma.review.aggregate({
    where: { placeId },
    _avg: { rating: true },
    _count: true,
  });
  const avg = agg._avg.rating ?? 0;
  await prisma.place.update({
    where: { id: placeId },
    data: {
      averageRating: Math.round(avg * 10) / 10,
      ratingCount: agg._count,
    },
  });
}

function mapReviewListItem(r: {
  id: string;
  userId: number;
  rating: number;
  content: string;
  createdAt: Date;
  user: { fullName: string | null; username: string | null; avatarUrl: string | null };
  images: { url: string }[];
  _count: { likes: number };
}): ReviewListItem {
  return reviewListItemSchema.parse({
    id: r.id,
    username: r.user.fullName || r.user.username || "Traveler",
    rating: r.rating,
    date: r.createdAt.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }),
    content: r.content,
    avatarUrl: r.user.avatarUrl,
    imageUrls: r.images.map((i) => i.url),
    likes: r._count.likes,
  });
}

export const reviewsService = {
  async listForPlace(placeId: string, paging: Pagination) {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });
    if (!place) throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });

    const where = { placeId };
    const [total, list] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: { select: { fullName: true, username: true, avatarUrl: true } },
          images: true,
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: paging.offset,
        take: paging.limit,
      }),
    ]);

    return {
      items: list.map(mapReviewListItem),
      total,
      limit: paging.limit,
      offset: paging.offset,
    };
  },

  async listForUser(userId: number, paging: Pagination) {
    const where = { userId };
    const [total, list] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          place: {
            select: { id: true, name: true, coverImageUrl: true, region: true },
          },
          images: true,
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: paging.offset,
        take: paging.limit,
      }),
    ]);

    return {
      items: list.map(
        (r): UserReviewListItem =>
          userReviewListItemSchema.parse({
            id: r.id,
            placeId: r.placeId,
            placeName: r.place.name,
            placeImageUrl: r.place.coverImageUrl,
            placeRegion: r.place.region,
            rating: r.rating,
            date: r.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric",
            }),
            content: r.content,
            imageUrls: r.images.map((i) => i.url),
            likes: r._count.likes,
          })
      ),
      total,
      limit: paging.limit,
      offset: paging.offset,
    };
  },

  async create(placeId: string, userId: number, body: unknown) {
    const data = reviewCreateRequestSchema.parse(body);
    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });

    const rev = await prisma.review.create({
      data: {
        placeId,
        userId,
        rating: data.rating,
        content: data.content,
        images: data.imageUrls?.length
          ? { create: data.imageUrls.map((url) => ({ url })) }
          : undefined,
      },
    });
    await recalcPlaceStats(placeId);
    return rev;
  },

  async toggleLike(reviewId: string, userId: number): Promise<ReviewLikeToggleResponse> {
    const rev = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!rev) throw Object.assign(new Error("REVIEW_NOT_FOUND"), { statusCode: 404 });

    const existing = await prisma.reviewLike.findFirst({
      where: { reviewId, userId },
    });
    if (existing) {
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      const count = await prisma.reviewLike.count({ where: { reviewId } });
      return reviewLikeToggleSchema.parse({ liked: false, likes: count });
    }
    await prisma.reviewLike.create({ data: { reviewId, userId } });
    const count = await prisma.reviewLike.count({ where: { reviewId } });
    return reviewLikeToggleSchema.parse({ liked: true, likes: count });
  },

  async update(reviewId: string, userId: number, body: unknown): Promise<ReviewMutationResult> {
    const data = reviewUpdateRequestSchema.parse(body);
    const rev = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!rev) throw Object.assign(new Error("REVIEW_NOT_FOUND"), { statusCode: 404 });
    if (rev.userId !== userId)
      throw Object.assign(new Error("FORBIDDEN"), { statusCode: 403 });

    const placeId = rev.placeId;
    await prisma.$transaction(async (tx) => {
      if (data.imageUrls !== undefined) {
        await tx.reviewImage.deleteMany({ where: { reviewId } });
        if (data.imageUrls.length > 0) {
          await tx.reviewImage.createMany({
            data: data.imageUrls.map((url) => ({ reviewId, url })),
          });
        }
      }
      await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(data.rating !== undefined ? { rating: data.rating } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
        },
      });
    });
    await recalcPlaceStats(placeId);
    return reviewMutationResultSchema.parse({ id: reviewId });
  },

  async remove(reviewId: string, userId: number) {
    const rev = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!rev) throw Object.assign(new Error("REVIEW_NOT_FOUND"), { statusCode: 404 });
    if (rev.userId !== userId)
      throw Object.assign(new Error("FORBIDDEN"), { statusCode: 403 });

    const placeId = rev.placeId;
    await prisma.review.delete({ where: { id: reviewId } });
    await recalcPlaceStats(placeId);
  },
};
