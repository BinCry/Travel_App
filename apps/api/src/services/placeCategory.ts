import { PlaceCategory as PrismaPlaceCategory } from "@prisma/client";
import type { PlaceCategory } from "@travel-app/shared/contracts/places";

const sharedToPrismaCategory: Record<PlaceCategory, PrismaPlaceCategory> = {
  attractions: PrismaPlaceCategory.ATTRACTIONS,
  dining: PrismaPlaceCategory.DINING,
  festivals: PrismaPlaceCategory.FESTIVALS,
};

const prismaToSharedCategory: Record<PrismaPlaceCategory, PlaceCategory> = {
  [PrismaPlaceCategory.ATTRACTIONS]: "attractions",
  [PrismaPlaceCategory.DINING]: "dining",
  [PrismaPlaceCategory.FESTIVALS]: "festivals",
};

export function toPrismaPlaceCategory(category: PlaceCategory): PrismaPlaceCategory {
  return sharedToPrismaCategory[category];
}

export function fromPrismaPlaceCategory(category: PrismaPlaceCategory): PlaceCategory {
  return prismaToSharedCategory[category];
}
