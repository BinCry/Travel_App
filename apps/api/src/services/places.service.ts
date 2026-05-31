import { PlaceCategory } from "@prisma/client";
import {
  placeCategorySchema,
  placeDetailSchema,
  placeListItemSchema,
  placeReviewSchema,
  type PlaceDetail,
  type PlaceListItem,
  type PlaceReview,
} from "@travel-app/shared/contracts/places";
import { placeUpdateSchema } from "@travel-app/shared/contracts/place-updates";
import type { OwnerReviewReply } from "@travel-app/shared/contracts/reviews";
import { prisma } from "../database/client.js";
import type { Pagination } from "../http/pagination.js";
import { fromPrismaPlaceCategory, toPrismaPlaceCategory } from "./placeCategory.js";

function toListDto(p: {
  id: string;
  name: string;
  region: string;
  category: PlaceCategory;
  averageRating: number;
  ratingCount: number;
  featureLabel: string;
  coverImageUrl: string;
}): PlaceListItem {
  return placeListItemSchema.parse({
    id: p.id,
    name: p.name,
    location: p.region,
    category: fromPrismaPlaceCategory(p.category),
    rating: p.averageRating,
    ratingCount: p.ratingCount,
    featureLabel: p.featureLabel,
    imageUrl: p.coverImageUrl,
  });
}

function formatReviewDate(d: Date) {
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function mapPlaceUpdate(update: {
  id: string;
  placeId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  owner: { fullName: string | null; username: string | null };
}) {
  return placeUpdateSchema.parse({
    id: update.id,
    placeId: update.placeId,
    ownerName: update.owner.fullName || update.owner.username || "Chủ địa điểm",
    title: update.title,
    content: update.content,
    createdAt: update.createdAt.toISOString(),
    updatedAt: update.updatedAt.toISOString(),
  });
}

function resolvePlaceRatingMetrics(
  ratings: number[],
  fallbackAverage: number,
  fallbackCount: number
) {
  if (ratings.length === 0) {
    return {
      averageRating: fallbackAverage,
      ratingCount: fallbackCount,
    };
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return {
    averageRating: Math.round((total / ratings.length) * 10) / 10,
    ratingCount: ratings.length,
  };
}

export const placesService = {
  async list(query: Record<string, string | undefined>, paging: Pagination) {
    const catKey = query.category?.toLowerCase();
    const category = catKey ? toPrismaPlaceCategory(placeCategorySchema.parse(catKey)) : undefined;
    const where = category ? { category } : {};
    const [total, list] = await Promise.all([
      prisma.place.count({ where }),
      prisma.place.findMany({
        where,
        orderBy: { ratingCount: "desc" },
        skip: paging.offset,
        take: paging.limit,
      }),
    ]);
    const placeIds = list.map((place) => place.id);
    const reviewMetrics =
      placeIds.length > 0
        ? await prisma.review.groupBy({
            by: ["placeId"],
            where: { placeId: { in: placeIds } },
            _avg: { rating: true },
            _count: { placeId: true },
          })
        : [];

    const metricsByPlaceId = new Map(
      reviewMetrics.map((metric) => [
        metric.placeId,
        {
          averageRating: metric._avg.rating ? Math.round(metric._avg.rating * 10) / 10 : 0,
          ratingCount: metric._count.placeId,
        },
      ])
    );

    return {
      items: list.map((place) =>
        toListDto({
          ...place,
          averageRating: metricsByPlaceId.get(place.id)?.averageRating ?? place.averageRating,
          ratingCount: metricsByPlaceId.get(place.id)?.ratingCount ?? place.ratingCount,
        })
      ),
      total,
      limit: paging.limit,
      offset: paging.offset,
    };
  },

  async getById(placeId: string): Promise<PlaceDetail | null> {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        reviews: {
          include: {
            user: { select: { fullName: true, username: true, avatarUrl: true } },
            images: true,
            reply: {
              include: {
                owner: { select: { fullName: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        updates: {
          include: {
            owner: { select: { fullName: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!place) return null;

    const reviews = place.reviews.map((r): PlaceReview => {
      const displayName = r.user.fullName || r.user.username || "Khách du lịch";
      const ownerReply: OwnerReviewReply | null = r.reply
        ? {
            id: r.reply.id,
            ownerName: r.reply.owner.fullName || r.reply.owner.username || "Chủ địa điểm",
            content: r.reply.content,
            date: formatReviewDate(r.reply.createdAt),
          }
        : null;
      return placeReviewSchema.parse({
        avatarUrl: r.user.avatarUrl,
        name: displayName,
        date: formatReviewDate(r.createdAt),
        content: r.content,
        rating: r.rating,
        imageUrls: r.images.map((img) => img.url),
        ownerReply,
      });
    });

    const ratingMetrics = resolvePlaceRatingMetrics(
      place.reviews.map((review) => review.rating),
      place.averageRating,
      place.ratingCount
    );

    return placeDetailSchema.parse({
      id: place.id,
      name: place.name,
      location: place.region,
      category: fromPrismaPlaceCategory(place.category),
      rating: ratingMetrics.averageRating,
      ratingCount: ratingMetrics.ratingCount,
      imageUrl: place.coverImageUrl,
      featureLabel: place.featureLabel,
      about: place.about,
      priceLevel: place.priceLevel,
      reviews,
      updates: place.updates.map(mapPlaceUpdate),
    });
  },
};
