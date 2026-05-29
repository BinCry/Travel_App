import { BookingStatus as PrismaBookingStatus, Prisma } from "@prisma/client";
import {
  availabilitySlotCreateRequestSchema,
  availabilitySlotSchema,
  availabilitySlotUpdateRequestSchema,
  bookingCreateRequestSchema,
  bookingOptionCreateRequestSchema,
  bookingOptionSchema,
  bookingOptionUpdateRequestSchema,
  ownerBookingStatusUpdateRequestSchema,
  ownerPlaceBookingSchema,
  travelerBookingSchema,
  type AvailabilitySlot,
  type BookingStatus,
  type OwnerPlaceBooking,
  type TravelerBooking,
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

type TravelerBookingRecord = Prisma.BookingGetPayload<{
  include: {
    place: {
      select: {
        id: true;
        name: true;
        coverImageUrl: true;
      };
    };
    option: {
      select: {
        id: true;
        title: true;
      };
    };
    slot: {
      select: {
        id: true;
        startAt: true;
        endAt: true;
      };
    };
  };
}>;

type OwnerBookingRecord = Prisma.BookingGetPayload<{
  include: {
    traveler: {
      select: {
        fullName: true;
        username: true;
        email: true;
      };
    };
    place: {
      select: {
        id: true;
        name: true;
        coverImageUrl: true;
      };
    };
    option: {
      select: {
        id: true;
        title: true;
      };
    };
    slot: {
      select: {
        id: true;
        startAt: true;
        endAt: true;
      };
    };
  };
}>;

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
    durationMinutes: option.durationMinutes,
    maxPartySize: option.maxPartySize,
    isActive: option.isActive,
    slots: option.slots.map((slot) => mapSlot(slot, option)),
  });
}

function canCancelBooking(status: BookingStatus) {
  return CANCELABLE_STATUSES.has(status);
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
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    canCancel: canCancelBooking(booking.status),
  });
}

function mapOwnerBooking(booking: OwnerBookingRecord): OwnerPlaceBooking {
  return ownerPlaceBookingSchema.parse({
    ...mapTravelerBooking(booking),
    travelerName: booking.traveler.fullName || booking.traveler.username || "Khach du lich",
    travelerEmail: booking.traveler.email,
  });
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
      traveler: {
        select: {
          fullName: true,
          username: true,
          email: true,
        },
      },
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
        },
      },
      slot: {
        select: {
          id: true,
          startAt: true,
          endAt: true,
        },
      },
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

  async listMine(userId: number, paging: Pagination) {
    const where = { travelerId: userId };
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
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
            },
          },
          slot: {
            select: {
              id: true,
              startAt: true,
              endAt: true,
            },
          },
        },
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

  async create(userId: number, body: unknown) {
    const data = bookingCreateRequestSchema.parse(body);

    const booking = await prisma.$transaction(
      async (tx) => {
        const slot = await tx.availabilitySlot.findUnique({
          where: { id: data.slotId },
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

        const remainingCapacity = Math.max(
          0,
          slot.capacity - sumBookedPartySize(slot.bookings)
        );
        if (remainingCapacity < data.partySize) {
          throw Object.assign(new Error("BOOKING_SLOT_FULL"), { statusCode: 409 });
        }

        return tx.booking.create({
          data: {
            placeId: slot.option.place.id,
            optionId: slot.option.id,
            slotId: slot.id,
            travelerId: userId,
            partySize: data.partySize,
            note: normalizeOptionalString(data.note),
            status: "PENDING",
          },
          include: {
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
              },
            },
            slot: {
              select: {
                id: true,
                startAt: true,
                endAt: true,
              },
            },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return mapTravelerBooking(booking);
  },

  async cancel(userId: number, bookingId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, travelerId: userId },
      include: {
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
          },
        },
        slot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
          },
        },
      },
    });

    if (!booking) {
      throw Object.assign(new Error("BOOKING_NOT_FOUND"), { statusCode: 404 });
    }

    if (!canCancelBooking(booking.status)) {
      throw Object.assign(new Error("BOOKING_STATUS_INVALID"), { statusCode: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      include: {
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
          },
        },
        slot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
          },
        },
      },
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
    const bookingCount = await prisma.booking.count({
      where: { optionId: existing.id },
    });

    if (bookingCount > 0) {
      throw Object.assign(new Error("VALIDATION"), {
        statusCode: 400,
        issues: {
          formErrors: ["BOOKING_OPTION_HAS_BOOKINGS"],
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
          traveler: {
            select: {
              fullName: true,
              username: true,
              email: true,
            },
          },
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
            },
          },
          slot: {
            select: {
              id: true,
              startAt: true,
              endAt: true,
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

  async updateOwnerBookingStatus(ownerId: number, bookingId: string, body: unknown) {
    const booking = await getOwnedBooking(ownerId, bookingId);
    const data = ownerBookingStatusUpdateRequestSchema.parse(body);
    assertStatusTransition(booking.status, data.status);

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: data.status,
        cancelledAt: data.status === "CANCELLED" ? new Date() : booking.cancelledAt,
      },
      include: {
        traveler: {
          select: {
            fullName: true,
            username: true,
            email: true,
          },
        },
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
          },
        },
        slot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
          },
        },
      },
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
