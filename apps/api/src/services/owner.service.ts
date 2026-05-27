import {
  ownerPlaceDetailSchema,
  ownerPlaceSchema,
  ownerPlaceCreateRequestSchema,
  ownerPlaceUpdateRequestSchema,
  promotionItemSchema,
  ownerPromotionCreateRequestSchema,
  ownerPromotionUpdateRequestSchema,
  type OwnerPromotionCreateRequest,
} from "@travel-app/shared/contracts/owner";
import { prisma } from "../database/client.js";
import { fromPrismaPlaceCategory, toPrismaPlaceCategory } from "./placeCategory.js";

function toOwnerPlaceDto(p: {
  id: string;
  name: string;
  region: string;
  coverImageUrl: string;
}) {
  return ownerPlaceSchema.parse({
    id: p.id,
    name: p.name,
    location: p.region,
    imageUrl: p.coverImageUrl,
  });
}

function toPromotionDto(p: {
  id: string;
  title: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  days: string[];
  startTime: string;
  endTime: string;
  specificTime: boolean;
}) {
  return promotionItemSchema.parse({
    id: p.id,
    title: p.title,
    isActive: p.isActive,
    schedule: {
      startDate: p.startDate,
      endDate: p.endDate,
      days: p.days,
      startTime: p.startTime,
      endTime: p.endTime,
      specificTime: p.specificTime,
    },
  });
}

async function assertOwnedPlace(ownerId: number, placeId: string) {
  const place = await prisma.place.findFirst({
    where: { id: placeId, ownerId },
  });
  if (!place) throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
  return place;
}

async function createPromotionsForPlace(
  placeId: string,
  items: OwnerPromotionCreateRequest[]
) {
  if (!items.length) return;
  await prisma.promotion.createMany({
    data: items.map((item) => ({
      placeId,
      title: item.title,
      isActive: item.isActive ?? true,
      startDate: item.schedule.startDate,
      endDate: item.schedule.endDate,
      days: item.schedule.days,
      startTime: item.schedule.startTime ?? "",
      endTime: item.schedule.endTime ?? "",
      specificTime: item.schedule.specificTime ?? false,
    })),
  });
}

export const ownerService = {
  async listPlaces(ownerId: number) {
    const list = await prisma.place.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
    });
    return list.map(toOwnerPlaceDto);
  },

  async getPlace(ownerId: number, placeId: string) {
    const place = await prisma.place.findFirst({
      where: { id: placeId, ownerId },
      include: { promotions: { orderBy: { createdAt: "desc" } } },
    });
    if (!place) throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
    return ownerPlaceDetailSchema.parse({
      id: place.id,
      name: place.name,
      location: place.region,
      imageUrl: place.coverImageUrl,
      category: fromPrismaPlaceCategory(place.category),
      about: place.about,
      featureLabel: place.featureLabel,
      priceLevel: place.priceLevel,
      latitude: place.latitude,
      longitude: place.longitude,
      promotions: place.promotions.map(toPromotionDto),
    });
  },

  async createPlace(ownerId: number, body: unknown) {
    const data = ownerPlaceCreateRequestSchema.parse(body);
    const place = await prisma.place.create({
      data: {
        ownerId,
        name: data.name,
        region: data.region,
        category: toPrismaPlaceCategory(data.category),
        coverImageUrl: data.coverImageUrl,
        featureLabel: data.featureLabel ?? "Đang mở cửa",
        about: data.about ?? "",
        priceLevel: data.priceLevel ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
    if (data.promotions?.length) {
      await createPromotionsForPlace(place.id, data.promotions);
    }
    return toOwnerPlaceDto(place);
  },

  async updatePlace(ownerId: number, placeId: string, body: unknown) {
    await assertOwnedPlace(ownerId, placeId);
    const data = ownerPlaceUpdateRequestSchema.parse(body);
    const place = await prisma.place.update({
      where: { id: placeId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.region !== undefined ? { region: data.region } : {}),
        ...(data.category !== undefined
          ? { category: toPrismaPlaceCategory(data.category) }
          : {}),
        ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
        ...(data.featureLabel !== undefined ? { featureLabel: data.featureLabel } : {}),
        ...(data.about !== undefined ? { about: data.about } : {}),
        ...(data.priceLevel !== undefined ? { priceLevel: data.priceLevel } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
      },
    });
    return toOwnerPlaceDto(place);
  },

  async deletePlace(ownerId: number, placeId: string) {
    await assertOwnedPlace(ownerId, placeId);
    await prisma.place.delete({ where: { id: placeId } });
  },

  async listPromotions(ownerId: number, placeId: string) {
    await assertOwnedPlace(ownerId, placeId);
    const list = await prisma.promotion.findMany({
      where: { placeId },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toPromotionDto);
  },

  async createPromotion(ownerId: number, placeId: string, body: unknown) {
    await assertOwnedPlace(ownerId, placeId);
    const data = ownerPromotionCreateRequestSchema.parse(body);
    const promo = await prisma.promotion.create({
      data: {
        placeId,
        title: data.title,
        isActive: data.isActive ?? true,
        startDate: data.schedule.startDate,
        endDate: data.schedule.endDate,
        days: data.schedule.days,
        startTime: data.schedule.startTime ?? "",
        endTime: data.schedule.endTime ?? "",
        specificTime: data.schedule.specificTime ?? false,
      },
    });
    return toPromotionDto(promo);
  },

  async updatePromotion(ownerId: number, promotionId: string, body: unknown) {
    const promo = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { place: { select: { ownerId: true } } },
    });
    if (!promo || promo.place.ownerId !== ownerId) {
      throw Object.assign(new Error("PROMOTION_NOT_FOUND"), { statusCode: 404 });
    }
    const data = ownerPromotionUpdateRequestSchema.parse(body);

    const updated = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.schedule?.startDate !== undefined ? { startDate: data.schedule.startDate } : {}),
        ...(data.schedule?.endDate !== undefined ? { endDate: data.schedule.endDate } : {}),
        ...(data.schedule?.days !== undefined ? { days: data.schedule.days } : {}),
        ...(data.schedule?.startTime !== undefined ? { startTime: data.schedule.startTime } : {}),
        ...(data.schedule?.endTime !== undefined ? { endTime: data.schedule.endTime } : {}),
        ...(data.schedule?.specificTime !== undefined
          ? { specificTime: data.schedule.specificTime }
          : {}),
      },
    });
    return toPromotionDto(updated);
  },

  async deletePromotion(ownerId: number, promotionId: string) {
    const promo = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { place: { select: { ownerId: true } } },
    });
    if (!promo || promo.place.ownerId !== ownerId) {
      throw Object.assign(new Error("PROMOTION_NOT_FOUND"), { statusCode: 404 });
    }
    await prisma.promotion.delete({ where: { id: promotionId } });
  },

  async togglePromotion(ownerId: number, promotionId: string) {
    const promo = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { place: { select: { ownerId: true } } },
    });
    if (!promo || promo.place.ownerId !== ownerId) {
      throw Object.assign(new Error("PROMOTION_NOT_FOUND"), { statusCode: 404 });
    }
    const updated = await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive: !promo.isActive },
    });
    return toPromotionDto(updated);
  },
};
