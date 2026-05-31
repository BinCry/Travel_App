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
    "Notification",
    "Promotion",
    "BookingStatusHistory",
    "Booking",
    "Voucher",
    "AvailabilitySlot",
    "BookingOption",
    "TripStop",
    "Trip",
    "CollectionPlace",
    "Collection",
    "PlaceUpdate",
    "ReviewReply",
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

type ReviewFixtureInput = {
  id?: string;
  placeId: string;
  userId: number;
  rating?: number;
  content?: string;
};

type ReviewReplyFixtureInput = {
  id?: string;
  reviewId: string;
  ownerId: number;
  content?: string;
};

type TripFixtureInput = {
  id?: string;
  userId: number;
  title?: string;
  destination?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: string | null;
  notes?: string | null;
};

type CollectionFixtureInput = {
  id?: string;
  userId: number;
  title?: string;
  isPublic?: boolean;
};

type PlaceUpdateFixtureInput = {
  id?: string;
  placeId: string;
  ownerId: number;
  title?: string;
  content?: string;
};

type TripStopFixtureInput = {
  id?: string;
  dayNumber?: number;
  orderIndex?: number;
  title?: string;
  location?: string | null;
  note?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

type BookingOptionFixtureInput = {
  id?: string;
  placeId: string;
  title?: string;
  description?: string | null;
  priceLabel?: string | null;
  basePriceAmount?: number;
  currency?: string;
  durationMinutes?: number;
  maxPartySize?: number;
  isActive?: boolean;
};

type AvailabilitySlotFixtureInput = {
  id?: string;
  optionId: string;
  startAt?: Date;
  endAt?: Date;
  capacity?: number;
  isActive?: boolean;
};

type BookingFixtureInput = {
  id?: string;
  placeId: string;
  optionId: string;
  slotId: string;
  travelerId: number;
  partySize?: number;
  note?: string | null;
  ownerDecisionNote?: string | null;
  cancellationReason?: string | null;
  unitPriceAmount?: number;
  subtotalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  currency?: string;
  appliedVoucherCode?: string | null;
  voucherId?: string | null;
  status?: "DRAFT" | "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "REFUND_PENDING" | "REFUNDED";
};

type VoucherFixtureInput = {
  id?: string;
  placeId: string;
  optionId?: string | null;
  code?: string;
  title?: string;
  description?: string | null;
  isActive?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  usageLimit?: number | null;
  usedCount?: number;
  discountType?: "FIXED_AMOUNT" | "PERCENTAGE";
  discountValue?: number;
  maxDiscountAmount?: number | null;
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
      averageRating: input.averageRating ?? 0,
      ratingCount: input.ratingCount ?? 0,
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

export async function createReviewFixture(input: ReviewFixtureInput) {
  const review = await prisma.review.create({
    data: {
      id: input.id ?? randomUUID(),
      placeId: input.placeId,
      userId: input.userId,
      rating: input.rating ?? 5,
      content: input.content ?? "Review thử nghiệm",
    },
  });
  const aggregate = await prisma.review.aggregate({
    where: { placeId: input.placeId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.place.update({
    where: { id: input.placeId },
    data: {
      averageRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      ratingCount: aggregate._count,
    },
  });
  return review;
}

export async function createReviewReplyFixture(input: ReviewReplyFixtureInput) {
  return prisma.reviewReply.create({
    data: {
      id: input.id ?? randomUUID(),
      reviewId: input.reviewId,
      ownerId: input.ownerId,
      content: input.content ?? "Phản hồi thử nghiệm từ chủ địa điểm",
    },
  });
}

export async function createTripFixture(input: TripFixtureInput) {
  return prisma.trip.create({
    data: {
      id: input.id ?? randomUUID(),
      userId: input.userId,
      title: input.title ?? "Kế hoạch khám phá cuối tuần",
      destination: input.destination ?? "Đà Nẵng",
      startDate: input.startDate ?? new Date("2026-06-01"),
      endDate: input.endDate ?? new Date("2026-06-03"),
      budget: input.budget ?? "balanced",
      notes: input.notes ?? "Ưu tiên các địa điểm chill và dễ di chuyển.",
    },
  });
}

export async function createTripStopFixture(
  tripId: string,
  input: TripStopFixtureInput = {}
) {
  return prisma.tripStop.create({
    data: {
      id: input.id ?? randomUUID(),
      tripId,
      dayNumber: input.dayNumber ?? 1,
      orderIndex: input.orderIndex ?? 1,
      title: input.title ?? "Điểm dừng thử nghiệm",
      location: input.location ?? "Đà Nẵng",
      note: input.note ?? null,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
    },
  });
}

export async function createCollectionFixture(input: CollectionFixtureInput) {
  return prisma.collection.create({
    data: {
      id: input.id ?? randomUUID(),
      userId: input.userId,
      title: input.title ?? "Bộ sưu tập cuối tuần",
      isPublic: input.isPublic ?? false,
    },
  });
}

export async function addPlaceToCollectionFixture(collectionId: string, placeId: string) {
  return prisma.collectionPlace.create({
    data: {
      collectionId,
      placeId,
    },
  });
}

export async function createPlaceUpdateFixture(input: PlaceUpdateFixtureInput) {
  return prisma.placeUpdate.create({
    data: {
      id: input.id ?? randomUUID(),
      placeId: input.placeId,
      ownerId: input.ownerId,
      title: input.title ?? "Cập nhật mới",
      content: input.content ?? "Nội dung cập nhật thử nghiệm",
    },
  });
}

export async function createBookingOptionFixture(input: BookingOptionFixtureInput) {
  return prisma.bookingOption.create({
    data: {
      id: input.id ?? randomUUID(),
      placeId: input.placeId,
      title: input.title ?? "Bàn tối cho 2 người",
      description: input.description ?? "Option booking thử nghiệm",
      priceLabel: input.priceLabel ?? "350.000đ / bàn",
      basePriceAmount: input.basePriceAmount ?? 350000,
      currency: input.currency ?? "VND",
      durationMinutes: input.durationMinutes ?? 90,
      maxPartySize: input.maxPartySize ?? 2,
      isActive: input.isActive ?? true,
    },
  });
}

export async function createAvailabilitySlotFixture(input: AvailabilitySlotFixtureInput) {
  return prisma.availabilitySlot.create({
    data: {
      id: input.id ?? randomUUID(),
      optionId: input.optionId,
      startAt: input.startAt ?? new Date("2026-06-15T11:00:00.000Z"),
      endAt: input.endAt ?? new Date("2026-06-15T12:30:00.000Z"),
      capacity: input.capacity ?? 4,
      isActive: input.isActive ?? true,
    },
  });
}

export async function createBookingFixture(input: BookingFixtureInput) {
  const booking = await prisma.booking.create({
    data: {
      id: input.id ?? randomUUID(),
      placeId: input.placeId,
      optionId: input.optionId,
      slotId: input.slotId,
      travelerId: input.travelerId,
      voucherId: input.voucherId ?? null,
      partySize: input.partySize ?? 2,
      note: input.note ?? "Booking thử nghiệm",
      ownerDecisionNote: input.ownerDecisionNote ?? null,
      cancellationReason: input.cancellationReason ?? null,
      unitPriceAmount: input.unitPriceAmount ?? 350000,
      subtotalAmount: input.subtotalAmount ?? 350000,
      discountAmount: input.discountAmount ?? 0,
      finalAmount: input.finalAmount ?? 350000,
      currency: input.currency ?? "VND",
      appliedVoucherCode: input.appliedVoucherCode ?? null,
      status: input.status ?? "PENDING",
    },
  });
  await prisma.bookingStatusHistory.create({
    data: {
      bookingId: booking.id,
      status: booking.status,
      note: booking.note,
      actorRole: "TRAVELER",
      actorUserId: booking.travelerId,
      actorName: "Khách du lịch",
    },
  });
  return booking;
}

export async function createVoucherFixture(input: VoucherFixtureInput) {
  return prisma.voucher.create({
    data: {
      id: input.id ?? randomUUID(),
      placeId: input.placeId,
      optionId: input.optionId ?? null,
      code: input.code ?? `SAVE${Math.floor(Math.random() * 10000)}`,
      title: input.title ?? "Voucher thử nghiệm",
      description: input.description ?? "Áp dụng cho booking hợp lệ",
      isActive: input.isActive ?? true,
      startsAt: input.startsAt ?? new Date("2026-01-01T00:00:00.000Z"),
      endsAt: input.endsAt ?? new Date("2026-12-31T23:59:59.000Z"),
      usageLimit: input.usageLimit ?? 20,
      usedCount: input.usedCount ?? 0,
      discountType: input.discountType ?? "FIXED_AMOUNT",
      discountValue: input.discountValue ?? 50000,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
    },
  });
}

export function authHeader(user: { id: number; email: string }) {
  return {
    Authorization: `Bearer ${signAuthToken(user.id, user.email)}`,
  };
}
