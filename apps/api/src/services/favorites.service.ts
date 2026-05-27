import { placeListItemSchema, type PlaceListItem } from "@travel-app/shared/contracts/places";
import { prisma } from "../database/client.js";
import { fromPrismaPlaceCategory } from "./placeCategory.js";

export const favoritesService = {
  async list(userId: number): Promise<PlaceListItem[]> {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: {
        place: true,
      },
    });
    return rows.map(({ place: p }) =>
      placeListItemSchema.parse({
        id: p.id,
        name: p.name,
        location: p.region,
        category: fromPrismaPlaceCategory(p.category),
        rating: p.averageRating,
        ratingCount: p.ratingCount,
        featureLabel: p.featureLabel,
        imageUrl: p.coverImageUrl,
      })
    );
  },

  async add(userId: number, placeId: string) {
    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
    await prisma.favorite.upsert({
      where: { userId_placeId: { userId, placeId } },
      update: {},
      create: { userId, placeId },
    });
    return { ok: true };
  },

  async remove(userId: number, placeId: string) {
    await prisma.favorite.deleteMany({
      where: { userId, placeId },
    });
    return { ok: true };
  },

  async isFavorite(userId: number | undefined, placeId: string) {
    if (!userId) return false;
    const f = await prisma.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
      select: { userId: true },
    });
    return Boolean(f);
  },
};
