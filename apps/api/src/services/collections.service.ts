import { PlaceCategory } from "@prisma/client";
import {
  collectionCreateRequestSchema,
  collectionDetailSchema,
  collectionPlaceItemSchema,
  collectionSummarySchema,
  collectionUpdateRequestSchema,
  type CollectionDetail,
  type CollectionSummary,
} from "@travel-app/shared/contracts/collections";
import { placeListItemSchema, type PlaceListItem } from "@travel-app/shared/contracts/places";
import { prisma } from "../database/client.js";
import { fromPrismaPlaceCategory } from "./placeCategory.js";

function mapPlaceListItem(place: {
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
    id: place.id,
    name: place.name,
    location: place.region,
    category: fromPrismaPlaceCategory(place.category),
    rating: place.averageRating,
    ratingCount: place.ratingCount,
    featureLabel: place.featureLabel,
    imageUrl: place.coverImageUrl,
  });
}

function mapCollectionSummary(
  collection: {
    id: string;
    title: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: { places: number };
    places?: Array<{ placeId: string }>;
  },
  placeId?: string
): CollectionSummary {
  return collectionSummarySchema.parse({
    id: collection.id,
    title: collection.title,
    isPublic: collection.isPublic,
    placeCount: collection._count.places,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    ...(placeId
      ? {
          containsPlace: collection.places?.some((item) => item.placeId === placeId) ?? false,
        }
      : {}),
  });
}

function mapCollectionDetail(collection: {
  id: string;
  title: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  places: Array<{
    addedAt: Date;
    place: {
      id: string;
      name: string;
      region: string;
      category: PlaceCategory;
      averageRating: number;
      ratingCount: number;
      featureLabel: string;
      coverImageUrl: string;
    };
  }>;
}): CollectionDetail {
  return collectionDetailSchema.parse({
    id: collection.id,
    title: collection.title,
    isPublic: collection.isPublic,
    placeCount: collection.places.length,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    places: collection.places.map((entry) =>
      collectionPlaceItemSchema.parse({
        ...mapPlaceListItem(entry.place),
        addedAt: entry.addedAt.toISOString(),
      })
    ),
  });
}

async function assertOwnedCollection(userId: number, collectionId: string) {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
  });

  if (!collection) {
    throw Object.assign(new Error("COLLECTION_NOT_FOUND"), { statusCode: 404 });
  }

  return collection;
}

export const collectionsService = {
  async list(userId: number, query: Record<string, string | undefined> = {}) {
    const placeId = query.placeId?.trim() || undefined;
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        _count: { select: { places: true } },
        ...(placeId
          ? {
              places: {
                where: { placeId },
                select: { placeId: true },
              },
            }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return collections.map((collection) => mapCollectionSummary(collection, placeId));
  },

  async create(userId: number, body: unknown) {
    const data = collectionCreateRequestSchema.parse(body);
    const collection = await prisma.collection.create({
      data: {
        userId,
        title: data.title.trim(),
        isPublic: data.isPublic ?? false,
      },
      include: {
        _count: { select: { places: true } },
      },
    });

    return mapCollectionSummary(collection);
  },

  async getDetail(userId: number, collectionId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
      include: {
        places: {
          include: {
            place: true,
          },
          orderBy: [{ addedAt: "desc" }],
        },
      },
    });

    if (!collection) {
      throw Object.assign(new Error("COLLECTION_NOT_FOUND"), { statusCode: 404 });
    }

    return mapCollectionDetail(collection);
  },

  async update(userId: number, collectionId: string, body: unknown) {
    await assertOwnedCollection(userId, collectionId);
    const data = collectionUpdateRequestSchema.parse(body);
    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
      },
      include: {
        _count: { select: { places: true } },
      },
    });

    return mapCollectionSummary(updated);
  },

  async remove(userId: number, collectionId: string) {
    await assertOwnedCollection(userId, collectionId);
    await prisma.collection.delete({
      where: { id: collectionId },
    });
  },

  async addPlace(userId: number, collectionId: string, placeId: string) {
    await assertOwnedCollection(userId, collectionId);
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
    }

    await prisma.collectionPlace.upsert({
      where: {
        collectionId_placeId: {
          collectionId,
          placeId,
        },
      },
      update: {},
      create: {
        collectionId,
        placeId,
      },
    });
  },

  async removePlace(userId: number, collectionId: string, placeId: string) {
    await assertOwnedCollection(userId, collectionId);
    await prisma.collectionPlace.deleteMany({
      where: {
        collectionId,
        placeId,
      },
    });
  },
};
