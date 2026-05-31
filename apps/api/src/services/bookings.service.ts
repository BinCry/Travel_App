import {
  BookingStatus as PrismaBookingStatus,
  Prisma,
  VoucherDiscountType,
} from "@prisma/client";
import {
  availabilitySlotCreateRequestSchema,
  availabilitySlotSchema,
  availabilitySlotUpdateRequestSchema,
  bookingCreateRequestSchema,
  bookingOptionCreateRequestSchema,
  bookingOptionSchema,
  bookingOptionUpdateRequestSchema,
  bookingQuoteRequestSchema,
  bookingQuoteSchema,
  bookingStatusHistoryEntrySchema,
  ownerBookingDetailSchema,
  ownerBookingStatusUpdateRequestSchema,
  ownerPlaceBookingSchema,
  travelerBookingCancelRequestSchema,
  travelerBookingDetailSchema,
  travelerBookingSchema,
  type AvailabilitySlot,
  type BookingStatus,
  type BookingStatusHistoryEntry,
  type OwnerBookingDetail,
  type OwnerPlaceBooking,
  type TravelerBooking,
  type TravelerBookingDetail,
} from "@travel-app/shared/contracts/bookings";
import { prisma } from "../database/client.js";
import type { Pagination } from "../http/pagination.js";
import { notificationsService } from "./notifications.service.js";

const CAPACITY_BLOCKING_STATUSES: PrismaBookingStatus[] = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "REFUND_PENDING",
];

const CANCELABLE_STATUSES = new Set<BookingStatus>(["PENDING", "CONFIRMED"]);
const VOUCHER_RELEASE_STATUSES = new Set<BookingStatus>(["CANCELLED", "REJECTED"]);

const OWNER_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
};

const bookingBaseInclude = {
  place: {
    select: {
      id: true,
      name: true,
      coverImageUrl: true,
    },
  },
  option: {
    select: {
      id: true,
      title: true,
      basePriceAmount: true,
      currency: true,
    },
  },
  slot: {
    select: {
      id: true,
      startAt: true,
      endAt: true,
    },
  },
} satisfies Prisma.BookingInclude;

const bookingHistoryInclude = {
  statusHistory: {
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.BookingInclude;

type OptionWithSlots = Prisma.BookingOptionGetPayload<{
  include: {
    slots: {
      include: {
        bookings: {
          select: {
            partySize: true;
            status: true;
          };
        };
      };
      orderBy: {
        startAt: "asc";
      };
    };
  };
}>;

type BookingQuoteComputation = {
  voucherId: string | null;
  slotId: string;
  optionId: string;
  placeId: string;
  partySize: number;
  unitPriceAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  appliedVoucherCode: string | null;
  appliedVoucherTitle: string | null;
};

type TravelerBookingRecord = Prisma.BookingGetPayload<{
  include: typeof bookingBaseInclude;
}>;

type TravelerBookingDetailRecord = Prisma.BookingGetPayload<{
  include: typeof bookingBaseInclude & typeof bookingHistoryInclude;
}>;

type OwnerBookingRecord = Prisma.BookingGetPayload<{
  include: typeof bookingBaseInclude & {
    traveler: {
      select: {
        fullName: true;
        username: true;
        email: true;
      };
    };
  };
}>;

type OwnerBookingDetailRecord = Prisma.BookingGetPayload<{
  include: typeof bookingBaseInclude &
    typeof bookingHistoryInclude & {
      traveler: {
        select: {
          fullName: true;
          username: true;
          email: true;
        };
      };
    };
}>;

type SlotForQuote = Prisma.AvailabilitySlotGetPayload<{
  include: {
    option: {
      include: {
        place: {
          select: {
            id: true;
            name: true;
            coverImageUrl: true;
          };
        };
      };
    };
    bookings: {
      select: {
        partySize: true;
        status: true;
      };
    };
  };
}>;

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeVoucherCode(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

function parseDateTimeInput(value: string, field: "startAt" | "endAt") {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          [field]: ["INVALID_DATE_TIME"],
        },
      },
    });
  }
  return parsed;
}

function assertSlotRange(startAt: Date, endAt: Date) {
  if (startAt >= endAt) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          endAt: ["END_BEFORE_START"],
        },
      },
    });
  }
}

function formatDateLabel(value: Date) {
  return value.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTimeLabel(startAt: Date, endAt: Date) {
  const time = (value: Date) =>
    value.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${time(startAt)} - ${time(endAt)}`;
}

function sumBookedPartySize(
  bookings: Array<{ partySize: number; status: PrismaBookingStatus }>
) {
  return bookings.reduce((total, booking) => {
    if (!CAPACITY_BLOCKING_STATUSES.includes(booking.status)) {
      return total;
    }
    return total + booking.partySize;
  }, 0);
}

function mapSlot(
  slot: OptionWithSlots["slots"][number],
  option: Pick<OptionWithSlots, "id" | "isActive">
): AvailabilitySlot {
  const remainingCapacity = Math.max(0, slot.capacity - sumBookedPartySize(slot.bookings));
  const now = Date.now();
  return availabilitySlotSchema.parse({
    id: slot.id,
    optionId: option.id,
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
    dateLabel: formatDateLabel(slot.startAt),
    timeLabel: formatTimeLabel(slot.startAt, slot.endAt),
    capacity: slot.capacity,
    remainingCapacity,
    isActive: slot.isActive,
    isBookable:
      option.isActive &&
      slot.isActive &&
      slot.startAt.getTime() > now &&
      remainingCapacity > 0,
  });
}

function mapOption(option: OptionWithSlots) {
  return bookingOptionSchema.parse({
    id: option.id,
    placeId: option.placeId,
    title: option.title,
    description: option.description,
    priceLabel: option.priceLabel,
    basePriceAmount: option.basePriceAmount,
    currency: option.currency,
    durationMinutes: option.durationMinutes,
    maxPartySize: option.maxPartySize,
    isActive: option.isActive,
    slots: option.slots.map((slot) => mapSlot(slot, option)),
  });
}

function canCancelBooking(status: BookingStatus) {
  return CANCELABLE_STATUSES.has(status);
}

function mapStatusHistoryEntry(entry: {
  id: string;
  status: BookingStatus;
  note: string | null;
  actorRole: "TRAVELER" | "OWNER" | null;
  actorUserId: number | null;
  actorName: string | null;
  createdAt: Date;
}): BookingStatusHistoryEntry {
  return bookingStatusHistoryEntrySchema.parse({
    id: entry.id,
    status: entry.status,
    note: entry.note,
    actorRole:
      entry.actorRole === "TRAVELER"
        ? "traveler"
        : entry.actorRole === "OWNER"
          ? "owner"
          : "system",
    actorUserId: entry.actorUserId,
    actorName: entry.actorName,
    createdAt: entry.createdAt.toISOString(),
  });
}

function mapTravelerBooking(booking: TravelerBookingRecord): TravelerBooking {
  return travelerBookingSchema.parse({
    id: booking.id,
    placeId: booking.place.id,
    placeName: booking.place.name,
    placeImageUrl: booking.place.coverImageUrl,
    optionId: booking.option.id,
    optionTitle: booking.option.title,
    slotId: booking.slot.id,
    slotDateLabel: formatDateLabel(booking.slot.startAt),
    slotTimeLabel: formatTimeLabel(booking.slot.startAt, booking.slot.endAt),
    slotStartAt: booking.slot.startAt.toISOString(),
    slotEndAt: booking.slot.endAt.toISOString(),
    partySize: booking.partySize,
    note: booking.note,
    status: booking.status,
    unitPriceAmount: booking.unitPriceAmount,
    subtotalAmount: booking.subtotalAmount,
    discountAmount: booking.discountAmount,
    finalAmount: booking.finalAmount,
    currency: booking.currency,
    appliedVoucherCode: booking.appliedVoucherCode,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    canCancel: canCancelBooking(booking.status),
  });
}

function mapTravelerBookingDetail(
  booking: TravelerBookingDetailRecord
): TravelerBookingDetail {
  return travelerBookingDetailSchema.parse({
    ...mapTravelerBooking(booking),
    cancellationReason: booking.cancellationReason,
    ownerDecisionNote: booking.ownerDecisionNote,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    confirmedAt: booking.confirmedAt?.toISOString() ?? null,
    rejectedAt: booking.rejectedAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
    noShowAt: booking.noShowAt?.toISOString() ?? null,
    refundPendingAt: booking.refundPendingAt?.toISOString() ?? null,
    refundedAt: booking.refundedAt?.toISOString() ?? null,
    history: booking.statusHistory.map(mapStatusHistoryEntry),
  });
}

function mapOwnerBooking(booking: OwnerBookingRecord): OwnerPlaceBooking {
  return ownerPlaceBookingSchema.parse({
    ...mapTravelerBooking(booking),
    travelerName: booking.traveler.fullName || booking.traveler.username || "Khách du lịch",
    travelerEmail: booking.traveler.email,
  });
}

function mapOwnerBookingDetail(booking: OwnerBookingDetailRecord): OwnerBookingDetail {
  return ownerBookingDetailSchema.parse({
    ...mapOwnerBooking(booking),
    cancellationReason: booking.cancellationReason,
    ownerDecisionNote: booking.ownerDecisionNote,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    confirmedAt: booking.confirmedAt?.toISOString() ?? null,
    rejectedAt: booking.rejectedAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
    noShowAt: booking.noShowAt?.toISOString() ?? null,
    refundPendingAt: booking.refundPendingAt?.toISOString() ?? null,
    refundedAt: booking.refundedAt?.toISOString() ?? null,
    history: booking.statusHistory.map(mapStatusHistoryEntry),
  });
}

async function assertTraveler(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      fullName: true,
      username: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { statusCode: 404 });
  }

  if (user.role !== "TRAVELER") {
    throw Object.assign(new Error("FORBIDDEN"), { statusCode: 403 });
  }

  return user;
}

async function assertOwnedPlace(ownerId: number, placeId: string) {
  const place = await prisma.place.findFirst({
    where: { id: placeId, ownerId },
    select: { id: true, name: true },
  });

  if (!place) {
    throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
  }

  return place;
}

async function getOwnedOption(ownerId: number, optionId: string) {
  const option = await prisma.bookingOption.findFirst({
    where: {
      id: optionId,
      place: {
        is: {
          ownerId,
        },
      },
    },
    include: {
      slots: {
        include: {
          bookings: {
            select: {
              partySize: true,
              status: true,
            },
          },
        },
        orderBy: { startAt: "asc" },
      },
    },
  });

  if (!option) {
    throw Object.assign(new Error("BOOKING_OPTION_NOT_FOUND"), { statusCode: 404 });
  }

  return option;
}

async function getOwnedSlot(ownerId: number, slotId: string) {
  const slot = await prisma.availabilitySlot.findFirst({
    where: {
      id: slotId,
      option: {
        is: {
          place: {
            is: {
              ownerId,
            },
          },
        },
      },
    },
    include: {
      bookings: {
        select: {
          partySize: true,
          status: true,
        },
      },
      option: {
        select: {
          id: true,
          isActive: true,
        },
      },
    },
  });

  if (!slot) {
    throw Object.assign(new Error("BOOKING_SLOT_NOT_FOUND"), { statusCode: 404 });
  }

  return slot;
}

async function getOwnedBooking(ownerId: number, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      place: {
        is: {
          ownerId,
        },
      },
    },
    include: {
      ...bookingBaseInclude,
      ...bookingHistoryInclude,
      traveler: {
        select: {
          fullName: true,
          username: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    throw Object.assign(new Error("BOOKING_NOT_FOUND"), { statusCode: 404 });
  }

  return booking;
}

async function getTravelerBooking(userId: number, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      travelerId: userId,
    },
    include: {
      ...bookingBaseInclude,
      ...bookingHistoryInclude,
    },
  });

  if (!booking) {
    throw Object.assign(new Error("BOOKING_NOT_FOUND"), { statusCode: 404 });
  }

  return booking;
}

function assertStatusTransition(currentStatus: BookingStatus, nextStatus: BookingStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!OWNER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)) {
    throw Object.assign(new Error("BOOKING_STATUS_INVALID"), { statusCode: 400 });
  }
}

async function getSlotForQuote(
  client: Prisma.TransactionClient | typeof prisma,
  slotId: string
): Promise<SlotForQuote> {
  const slot = await client.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      option: {
        include: {
          place: {
            select: {
              id: true,
              name: true,
              coverImageUrl: true,
            },
          },
        },
      },
      bookings: {
        select: {
          partySize: true,
          status: true,
        },
      },
    },
  });

  if (!slot) {
    throw Object.assign(new Error("BOOKING_SLOT_NOT_FOUND"), { statusCode: 404 });
  }

  return slot;
}

async function resolveVoucherDiscount(
  client: Prisma.TransactionClient | typeof prisma,
  input: {
    placeId: string;
    optionId: string;
    voucherCode?: string | null;
    subtotalAmount: number;
  }
) {
  const normalizedCode = normalizeVoucherCode(input.voucherCode);
  if (!normalizedCode) {
    return {
      voucherId: null,
      appliedVoucherCode: null,
      appliedVoucherTitle: null,
      discountAmount: 0,
    };
  }

  const voucher = await client.voucher.findUnique({
    where: { code: normalizedCode },
  });

  if (!voucher) {
    throw Object.assign(new Error("VOUCHER_NOT_FOUND"), { statusCode: 404 });
  }

  if (!voucher.isActive) {
    throw Object.assign(new Error("VOUCHER_INACTIVE"), { statusCode: 400 });
  }

  if (voucher.placeId !== input.placeId) {
    throw Object.assign(new Error("VOUCHER_PLACE_MISMATCH"), { statusCode: 400 });
  }

  if (voucher.optionId && voucher.optionId !== input.optionId) {
    throw Object.assign(new Error("VOUCHER_OPTION_MISMATCH"), { statusCode: 400 });
  }

  const now = new Date();
  if (voucher.startsAt && voucher.startsAt > now) {
    throw Object.assign(new Error("VOUCHER_NOT_STARTED"), { statusCode: 400 });
  }

  if (voucher.endsAt && voucher.endsAt < now) {
    throw Object.assign(new Error("VOUCHER_EXPIRED"), { statusCode: 400 });
  }

  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    throw Object.assign(new Error("VOUCHER_USAGE_LIMIT_REACHED"), { statusCode: 409 });
  }

  let discountAmount = 0;
  if (voucher.discountType === VoucherDiscountType.FIXED_AMOUNT) {
    discountAmount = Math.min(input.subtotalAmount, voucher.discountValue);
  } else {
    discountAmount = Math.floor((input.subtotalAmount * voucher.discountValue) / 100);
    if (voucher.maxDiscountAmount != null) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
    }
    discountAmount = Math.min(discountAmount, input.subtotalAmount);
  }

  return {
    voucherId: voucher.id,
    appliedVoucherCode: voucher.code,
    appliedVoucherTitle: voucher.title,
    discountAmount,
  };
}

async function computeBookingQuote(
  client: Prisma.TransactionClient | typeof prisma,
  body: unknown
): Promise<BookingQuoteComputation> {
  const data = bookingQuoteRequestSchema.parse(body);
  const slot = await getSlotForQuote(client, data.slotId);

  if (!slot.option.isActive || !slot.isActive || slot.startAt <= new Date()) {
    throw Object.assign(new Error("BOOKING_SLOT_UNAVAILABLE"), { statusCode: 400 });
  }

  if (data.partySize > slot.option.maxPartySize) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          partySize: ["EXCEEDS_MAX_PARTY_SIZE"],
        },
      },
    });
  }

  const remainingCapacity = Math.max(0, slot.capacity - sumBookedPartySize(slot.bookings));
  if (remainingCapacity < data.partySize) {
    throw Object.assign(new Error("BOOKING_SLOT_FULL"), { statusCode: 409 });
  }

  const unitPriceAmount = slot.option.basePriceAmount;
  const subtotalAmount = unitPriceAmount;
  const voucher = await resolveVoucherDiscount(client, {
    placeId: slot.option.place.id,
    optionId: slot.option.id,
    voucherCode: data.voucherCode,
    subtotalAmount,
  });
  const finalAmount = Math.max(0, subtotalAmount - voucher.discountAmount);

  return {
    voucherId: voucher.voucherId,
    slotId: slot.id,
    optionId: slot.option.id,
    placeId: slot.option.place.id,
    partySize: data.partySize,
    unitPriceAmount,
    subtotalAmount,
    discountAmount: voucher.discountAmount,
    finalAmount,
    currency: slot.option.currency,
    appliedVoucherCode: voucher.appliedVoucherCode,
    appliedVoucherTitle: voucher.appliedVoucherTitle,
  };
}

function buildStatusTimestampPatch(status: BookingStatus) {
  const now = new Date();
  switch (status) {
    case "CONFIRMED":
      return { confirmedAt: now };
    case "REJECTED":
      return { rejectedAt: now };
    case "CANCELLED":
      return { cancelledAt: now };
    case "COMPLETED":
      return { completedAt: now };
    case "NO_SHOW":
      return { noShowAt: now };
    case "REFUND_PENDING":
      return { refundPendingAt: now };
    case "REFUNDED":
      return { refundedAt: now };
    default:
      return {};
  }
}

async function appendStatusHistory(
  client: Prisma.TransactionClient | typeof prisma,
  input: {
    bookingId: string;
    status: BookingStatus;
    note?: string | null;
    actorRole: "TRAVELER" | "OWNER" | null;
    actorUserId?: number | null;
    actorName?: string | null;
  }
) {
  await client.bookingStatusHistory.create({
    data: {
      bookingId: input.bookingId,
      status: input.status,
      note: normalizeOptionalString(input.note),
      actorRole: input.actorRole,
      actorUserId: input.actorUserId ?? null,
      actorName: normalizeOptionalString(input.actorName),
    },
  });
}

async function releaseVoucherUsageIfNeeded(
  client: Prisma.TransactionClient | typeof prisma,
  booking: {
    voucherId: string | null;
    status: BookingStatus;
  },
  nextStatus: BookingStatus
) {
  if (
    !booking.voucherId ||
    !VOUCHER_RELEASE_STATUSES.has(nextStatus) ||
    VOUCHER_RELEASE_STATUSES.has(booking.status)
  ) {
    return;
  }

  await client.voucher.updateMany({
    where: {
      id: booking.voucherId,
      usedCount: {
        gt: 0,
      },
    },
    data: {
      usedCount: {
        decrement: 1,
      },
    },
  });
}

export const bookingsService = {
  async listPlaceAvailability(placeId: string) {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
    }

    const options = await prisma.bookingOption.findMany({
      where: {
        placeId,
        isActive: true,
      },
      include: {
        slots: {
          where: {
            startAt: {
              gt: new Date(),
            },
            isActive: true,
          },
          include: {
            bookings: {
              select: {
                partySize: true,
                status: true,
              },
            },
          },
          orderBy: { startAt: "asc" },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return options.map(mapOption);
  },

  async quote(userId: number, body: unknown) {
    await assertTraveler(userId);
    const quote = await computeBookingQuote(prisma, body);
    return bookingQuoteSchema.parse({
      ...quote,
    });
  },

  async listMine(userId: number, paging: Pagination) {
    await assertTraveler(userId);
    const where = { travelerId: userId };
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: bookingBaseInclude,
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
        skip: paging.offset,
        take: paging.limit,
      }),
    ]);

    return {
      items: bookings.map(mapTravelerBooking),
      total,
      limit: paging.limit,
      offset: paging.offset,
    };
  },

  async getMineDetail(userId: number, bookingId: string) {
    await assertTraveler(userId);
    const booking = await getTravelerBooking(userId, bookingId);
    return mapTravelerBookingDetail(booking);
  },

  async create(userId: number, body: unknown) {
    const traveler = await assertTraveler(userId);
    const data = bookingCreateRequestSchema.parse(body);

    const booking = await prisma.$transaction(
      async (tx) => {
        const quote = await computeBookingQuote(tx, data);

        const created = await tx.booking.create({
          data: {
            placeId: quote.placeId,
            optionId: quote.optionId,
            slotId: quote.slotId,
            travelerId: userId,
            voucherId: quote.voucherId,
            partySize: quote.partySize,
            note: normalizeOptionalString(data.note),
            status: "PENDING",
            unitPriceAmount: quote.unitPriceAmount,
            subtotalAmount: quote.subtotalAmount,
            discountAmount: quote.discountAmount,
            finalAmount: quote.finalAmount,
            currency: quote.currency,
            appliedVoucherCode: quote.appliedVoucherCode,
          },
          include: bookingBaseInclude,
        });

        if (quote.voucherId) {
          await tx.voucher.update({
            where: { id: quote.voucherId },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });
        }

        await appendStatusHistory(tx, {
          bookingId: created.id,
          status: "PENDING",
          note: data.note,
          actorRole: "TRAVELER",
          actorUserId: traveler.id,
          actorName: traveler.fullName || traveler.username || "Khách du lịch",
        });

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return mapTravelerBooking(booking);
  },

  async cancel(userId: number, bookingId: string, body: unknown) {
    const traveler = await assertTraveler(userId);
    const data = travelerBookingCancelRequestSchema.parse(body ?? {});

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, travelerId: userId },
      include: bookingBaseInclude,
    });

    if (!booking) {
      throw Object.assign(new Error("BOOKING_NOT_FOUND"), { statusCode: 404 });
    }

    if (!canCancelBooking(booking.status)) {
      throw Object.assign(new Error("BOOKING_STATUS_INVALID"), { statusCode: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await releaseVoucherUsageIfNeeded(tx, booking, "CANCELLED");

      const nextBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: normalizeOptionalString(data.cancellationReason),
        },
        include: bookingBaseInclude,
      });

      await appendStatusHistory(tx, {
        bookingId: nextBooking.id,
        status: "CANCELLED",
        note: data.cancellationReason,
        actorRole: "TRAVELER",
        actorUserId: traveler.id,
        actorName: traveler.fullName || traveler.username || "Khách du lịch",
      });

      return nextBooking;
    });

    return mapTravelerBooking(updated);
  },

  async listOwnerOptions(ownerId: number, placeId: string) {
    await assertOwnedPlace(ownerId, placeId);
    const options = await prisma.bookingOption.findMany({
      where: { placeId },
      include: {
        slots: {
          include: {
            bookings: {
              select: {
                partySize: true,
                status: true,
              },
            },
          },
          orderBy: { startAt: "asc" },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return options.map(mapOption);
  },

  async createOwnerOption(ownerId: number, placeId: string, body: unknown) {
    await assertOwnedPlace(ownerId, placeId);
    const data = bookingOptionCreateRequestSchema.parse(body);
    const option = await prisma.bookingOption.create({
      data: {
        placeId,
        title: data.title.trim(),
        description: normalizeOptionalString(data.description),
        priceLabel: normalizeOptionalString(data.priceLabel),
        basePriceAmount: data.basePriceAmount,
        currency: data.currency?.trim() || "VND",
        durationMinutes: data.durationMinutes,
        maxPartySize: data.maxPartySize,
        isActive: data.isActive ?? true,
      },
      include: {
        slots: {
          include: {
            bookings: {
              select: {
                partySize: true,
                status: true,
              },
            },
          },
          orderBy: { startAt: "asc" },
        },
      },
    });

    return mapOption(option);
  },

  async updateOwnerOption(ownerId: number, optionId: string, body: unknown) {
    const existing = await getOwnedOption(ownerId, optionId);
    const data = bookingOptionUpdateRequestSchema.parse(body);
    const option = await prisma.bookingOption.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined
          ? { description: normalizeOptionalString(data.description) }
          : {}),
        ...(data.priceLabel !== undefined
          ? { priceLabel: normalizeOptionalString(data.priceLabel) }
          : {}),
        ...(data.basePriceAmount !== undefined
          ? { basePriceAmount: data.basePriceAmount }
          : {}),
        ...(data.currency !== undefined ? { currency: data.currency.trim() } : {}),
        ...(data.durationMinutes !== undefined
          ? { durationMinutes: data.durationMinutes }
          : {}),
        ...(data.maxPartySize !== undefined ? { maxPartySize: data.maxPartySize } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: {
        slots: {
          include: {
            bookings: {
              select: {
                partySize: true,
                status: true,
              },
            },
          },
          orderBy: { startAt: "asc" },
        },
      },
    });

    return mapOption(option);
  },

  async deleteOwnerOption(ownerId: number, optionId: string) {
    const existing = await getOwnedOption(ownerId, optionId);
    const [bookingCount, voucherCount] = await Promise.all([
      prisma.booking.count({
        where: { optionId: existing.id },
      }),
      prisma.voucher.count({
        where: { optionId: existing.id },
      }),
    ]);

    if (bookingCount > 0) {
      throw Object.assign(new Error("VALIDATION"), {
        statusCode: 400,
        issues: {
          formErrors: ["BOOKING_OPTION_HAS_BOOKINGS"],
          fieldErrors: {},
        },
      });
    }

    if (voucherCount > 0) {
      throw Object.assign(new Error("VALIDATION"), {
        statusCode: 400,
        issues: {
          formErrors: ["BOOKING_OPTION_HAS_VOUCHERS"],
          fieldErrors: {},
        },
      });
    }

    await prisma.bookingOption.delete({ where: { id: existing.id } });
  },

  async createOwnerSlot(ownerId: number, optionId: string, body: unknown) {
    const option = await getOwnedOption(ownerId, optionId);
    const data = availabilitySlotCreateRequestSchema.parse(body);
    const startAt = parseDateTimeInput(data.startAt, "startAt");
    const endAt = parseDateTimeInput(data.endAt, "endAt");
    assertSlotRange(startAt, endAt);

    const slot = await prisma.availabilitySlot.create({
      data: {
        optionId: option.id,
        startAt,
        endAt,
        capacity: data.capacity,
        isActive: data.isActive ?? true,
      },
      include: {
        bookings: {
          select: {
            partySize: true,
            status: true,
          },
        },
      },
    });

    return mapSlot(slot, option);
  },

  async updateOwnerSlot(ownerId: number, slotId: string, body: unknown) {
    const existing = await getOwnedSlot(ownerId, slotId);
    const data = availabilitySlotUpdateRequestSchema.parse(body);
    const nextStartAt =
      data.startAt !== undefined
        ? parseDateTimeInput(data.startAt, "startAt")
        : existing.startAt;
    const nextEndAt =
      data.endAt !== undefined ? parseDateTimeInput(data.endAt, "endAt") : existing.endAt;
    assertSlotRange(nextStartAt, nextEndAt);

    const slot = await prisma.availabilitySlot.update({
      where: { id: existing.id },
      data: {
        ...(data.startAt !== undefined ? { startAt: nextStartAt } : {}),
        ...(data.endAt !== undefined ? { endAt: nextEndAt } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: {
        bookings: {
          select: {
            partySize: true,
            status: true,
          },
        },
        option: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    const usedCapacity = sumBookedPartySize(slot.bookings);
    if (slot.capacity < usedCapacity) {
      throw Object.assign(new Error("BOOKING_SLOT_FULL"), { statusCode: 409 });
    }

    return mapSlot(slot, slot.option);
  },

  async deleteOwnerSlot(ownerId: number, slotId: string) {
    const existing = await getOwnedSlot(ownerId, slotId);
    const bookingCount = await prisma.booking.count({
      where: { slotId: existing.id },
    });

    if (bookingCount > 0) {
      throw Object.assign(new Error("VALIDATION"), {
        statusCode: 400,
        issues: {
          formErrors: ["BOOKING_SLOT_HAS_BOOKINGS"],
          fieldErrors: {},
        },
      });
    }

    await prisma.availabilitySlot.delete({ where: { id: existing.id } });
  },

  async listOwnerBookings(ownerId: number, placeId: string, paging: Pagination) {
    await assertOwnedPlace(ownerId, placeId);
    const where = { placeId };
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          ...bookingBaseInclude,
          traveler: {
            select: {
              fullName: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
        skip: paging.offset,
        take: paging.limit,
      }),
    ]);

    return {
      items: bookings.map(mapOwnerBooking),
      total,
      limit: paging.limit,
      offset: paging.offset,
    };
  },

  async getOwnerBookingDetail(ownerId: number, bookingId: string) {
    const booking = await getOwnedBooking(ownerId, bookingId);
    return mapOwnerBookingDetail(booking);
  },

  async updateOwnerBookingStatus(ownerId: number, bookingId: string, body: unknown) {
    const booking = await getOwnedBooking(ownerId, bookingId);
    const data = ownerBookingStatusUpdateRequestSchema.parse(body);
    assertStatusTransition(booking.status, data.status);

    const updated = await prisma.$transaction(async (tx) => {
      await releaseVoucherUsageIfNeeded(tx, booking, data.status);

      const nextBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: data.status,
          ...(data.ownerDecisionNote !== undefined
            ? { ownerDecisionNote: normalizeOptionalString(data.ownerDecisionNote) }
            : {}),
          ...(data.cancellationReason !== undefined
            ? { cancellationReason: normalizeOptionalString(data.cancellationReason) }
            : {}),
          ...buildStatusTimestampPatch(data.status),
        },
        include: {
          ...bookingBaseInclude,
          traveler: {
            select: {
              fullName: true,
              username: true,
              email: true,
            },
          },
        },
      });

      await appendStatusHistory(tx, {
        bookingId: nextBooking.id,
        status: data.status,
        note: data.ownerDecisionNote ?? data.cancellationReason ?? null,
        actorRole: "OWNER",
        actorUserId: ownerId,
        actorName: "Chủ địa điểm",
      });

      return nextBooking;
    });

    if (booking.status !== data.status) {
      await notificationsService.notifyBookingStatusChange({
        travelerId: booking.travelerId,
        placeId: booking.place.id,
        placeName: booking.place.name,
        bookingId: booking.id,
        status: data.status,
      });
    }

    return mapOwnerBooking(updated);
  },
};
