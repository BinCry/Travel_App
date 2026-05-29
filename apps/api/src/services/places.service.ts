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
    return {
      items: list.map(toListDto),
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
      },
    });
    if (!place) return null;

    const reviews = place.reviews.map((r): PlaceReview => {
      const displayName = r.user.fullName || r.user.username || "Khách du lịch";
      const ownerReply: OwnerReviewReply | null = r.reply
        ? {
            id: r.reply.id,
            ownerName: r.reply.owner.fullName || r.reply.owner.username || "Chu dia diem",
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

    return placeDetailSchema.parse({
      id: place.id,
      name: place.name,
      location: place.region,
      category: fromPrismaPlaceCategory(place.category),
      rating: place.averageRating,
      ratingCount: place.ratingCount,
      imageUrl: place.coverImageUrl,
      featureLabel: place.featureLabel,
      about: place.about,
      priceLevel: place.priceLevel,
      reviews,
    });
  },
};
