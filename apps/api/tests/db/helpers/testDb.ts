process.env.NODE_ENV ??= "test";
process.env.PORT ??= "8000";
process.env.PUBLIC_BASE_URL ??= "http://127.0.0.1:8000";
process.env.UPLOADS_DIR ??= ".tmp/test-uploads";
process.env.JWT_SECRET ??= "test-secret-for-db-tests";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PlaceCategory, UserRole } from "@prisma/client";
import { prisma } from "../../../src/database/client.js";
import { signAuthToken } from "../../../src/services/auth-token.js";

const TRUNCATE_SQL = `
  TRUNCATE TABLE
    "EmailVerificationOtp",
    "PasswordResetOtp",
    "Promotion",
    "Favorite",
    "ReviewLike",
    "ReviewImage",
    "Review",
    "Place",
    "User"
  RESTART IDENTITY CASCADE
`;

type UserFixtureInput = {
  email?: string;
  password?: string;
  role?: UserRole;
  verified?: boolean;
  fullName?: string | null;
  username?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
};

type PlaceFixtureInput = {
  id?: string;
  ownerId?: number | null;
  name?: string;
  region?: string;
  category?: PlaceCategory;
  coverImageUrl?: string;
  featureLabel?: string;
  averageRating?: number;
  ratingCount?: number;
  about?: string;
  priceLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type PromotionFixtureInput = {
  id?: string;
  title?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  specificTime?: boolean;
};

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(TRUNCATE_SQL);
}

export async function createUserFixture(input: UserFixtureInput = {}) {
  const password = input.password ?? "secret123";
  const passwordHash = await bcrypt.hash(password, 4);

  return prisma.user.create({
    data: {
      email: input.email ?? `${randomUUID()}@example.com`,
      passwordHash,
      role: input.role ?? "TRAVELER",
      emailVerifiedAt: input.verified === false ? null : new Date(),
      fullName: input.fullName ?? "Người dùng thử nghiệm",
      username: input.username ?? null,
      location: input.location ?? "Đà Nẵng",
      avatarUrl: input.avatarUrl ?? null,
    },
  });
}

export async function createPlaceFixture(input: PlaceFixtureInput = {}) {
  return prisma.place.create({
    data: {
      id: input.id ?? randomUUID(),
      ownerId: input.ownerId ?? null,
      name: input.name ?? "Điểm đến thử nghiệm",
      region: input.region ?? "Đà Nẵng",
      category: input.category ?? "ATTRACTIONS",
      coverImageUrl: input.coverImageUrl ?? "https://example.com/place.jpg",
      featureLabel: input.featureLabel ?? "Đang mở cửa",
      averageRating: input.averageRating ?? 4.5,
      ratingCount: input.ratingCount ?? 12,
      about: input.about ?? "Mô tả thử nghiệm",
      priceLevel: input.priceLevel ?? 2,
      latitude: input.latitude ?? 16.0471,
      longitude: input.longitude ?? 108.2068,
    },
  });
}

export async function createPromotionFixture(
  placeId: string,
  input: PromotionFixtureInput = {}
) {
  return prisma.promotion.create({
    data: {
      id: input.id ?? randomUUID(),
      placeId,
      title: input.title ?? "Ưu đãi thử nghiệm",
      isActive: input.isActive ?? true,
      startDate: input.startDate ?? "2026-05-01",
      endDate: input.endDate ?? "2026-06-01",
      days: input.days ?? ["monday", "friday"],
      startTime: input.startTime ?? "08:00",
      endTime: input.endTime ?? "20:00",
      specificTime: input.specificTime ?? true,
    },
  });
}

export function authHeader(user: { id: number; email: string }) {
  return {
    Authorization: `Bearer ${signAuthToken(user.id, user.email)}`,
  };
}
