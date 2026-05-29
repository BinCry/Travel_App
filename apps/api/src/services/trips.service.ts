import type { Prisma } from "@prisma/client";
import {
  tripCreateRequestSchema,
  tripDetailSchema,
  tripListItemSchema,
  tripStopCreateRequestSchema,
  tripStopSchema,
  tripStopUpdateRequestSchema,
  tripUpdateRequestSchema,
  type TripBudget,
  type TripDetail,
  type TripListItem,
} from "@travel-app/shared/contracts/trips";
import { prisma } from "../database/client.js";
import type { Pagination } from "../http/pagination.js";

type TripWithStops = Awaited<ReturnType<typeof getOwnedTripWithStops>>;
type TripTx = Prisma.TransactionClient;
type StopSequenceRecord = {
  id: string;
  dayNumber: number;
  orderIndex: number;
  createdAt: Date;
};

function parseDateInput(value?: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOutput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function assertDateRange(startDate: string | null, endDate: string | null) {
  if (startDate && endDate && startDate > endDate) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          endDate: ["END_DATE_BEFORE_START_DATE"],
        },
      },
    });
  }
}

function assertTimeRange(startTime: string | null, endTime: string | null) {
  if (startTime && endTime && startTime > endTime) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          endTime: ["END_TIME_BEFORE_START_TIME"],
        },
      },
    });
  }
}

function buildDuplicateTitle(title: string) {
  const suffix = " (ban sao)";
  if (title.length + suffix.length <= 120) {
    return `${title}${suffix}`;
  }
  return `${title.slice(0, 120 - suffix.length)}${suffix}`;
}

function buildStopSequence(
  stops: StopSequenceRecord[],
  move?: { stopId: string; targetDay: number; targetOrderIndex: number }
) {
  const sorted = [...stops].sort(
    (a, b) =>
      a.dayNumber - b.dayNumber ||
      a.orderIndex - b.orderIndex ||
      a.createdAt.getTime() - b.createdAt.getTime()
  );

  const movingStop = move ? sorted.find((stop) => stop.id === move.stopId) : null;
  if (move && !movingStop) {
    throw Object.assign(new Error("TRIP_STOP_NOT_FOUND"), { statusCode: 404 });
  }

  const grouped = new Map<number, StopSequenceRecord[]>();
  for (const stop of sorted) {
    if (move && stop.id === move.stopId) {
      continue;
    }
    const group = grouped.get(stop.dayNumber) ?? [];
    group.push(stop);
    grouped.set(stop.dayNumber, group);
  }

  if (move && movingStop) {
    const targetDay = move.targetDay;
    const dayStops = [...(grouped.get(targetDay) ?? [])];
    const insertAt = Math.min(
      Math.max(move.targetOrderIndex, 1),
      dayStops.length + 1
    ) - 1;
    dayStops.splice(insertAt, 0, { ...movingStop, dayNumber: targetDay });
    grouped.set(targetDay, dayStops);
  }

  return [...grouped.keys()]
    .sort((a, b) => a - b)
    .flatMap((dayNumber) =>
      (grouped.get(dayNumber) ?? []).map((stop, index) => ({
        id: stop.id,
        dayNumber,
        orderIndex: index + 1,
      }))
    );
}

async function reorderTripStops(
  tx: TripTx,
  tripId: string,
  move?: { stopId: string; targetDay: number; targetOrderIndex: number }
) {
  const stops = await tx.tripStop.findMany({
    where: { tripId },
    select: {
      id: true,
      dayNumber: true,
      orderIndex: true,
      createdAt: true,
    },
  });

  const planned = buildStopSequence(stops, move);

  for (const [index, stop] of planned.entries()) {
    await tx.tripStop.update({
      where: { id: stop.id },
      data: {
        dayNumber: stop.dayNumber,
        orderIndex: -1 * (index + 1),
      },
    });
  }

  for (const stop of planned) {
    await tx.tripStop.update({
      where: { id: stop.id },
      data: {
        dayNumber: stop.dayNumber,
        orderIndex: stop.orderIndex,
      },
    });
  }
}

function mapTripListItem(trip: {
  id: string;
  title: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: string | null;
  notes: string | null;
  updatedAt: Date;
  stops: { dayNumber: number }[];
}): TripListItem {
  return tripListItemSchema.parse({
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    startDate: formatDateOutput(trip.startDate),
    endDate: formatDateOutput(trip.endDate),
    budget: trip.budget ? (trip.budget as TripBudget) : null,
    notes: trip.notes,
    stopCount: trip.stops.length,
    dayCount: new Set(trip.stops.map((stop) => stop.dayNumber)).size,
    updatedAt: trip.updatedAt.toISOString(),
  });
}

function mapTripDetail(trip: TripWithStops): TripDetail {
  return tripDetailSchema.parse({
    ...mapTripListItem(trip),
    stops: trip.stops.map((stop: TripWithStops["stops"][number]) =>
      tripStopSchema.parse({
        id: stop.id,
        dayNumber: stop.dayNumber,
        orderIndex: stop.orderIndex,
        title: stop.title,
        location: stop.location,
        note: stop.note,
        startTime: stop.startTime,
        endTime: stop.endTime,
      })
    ),
  });
}

async function getOwnedTripWithStops(userId: number, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      stops: {
        orderBy: [{ dayNumber: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!trip) {
    throw Object.assign(new Error("TRIP_NOT_FOUND"), { statusCode: 404 });
  }

  return trip;
}

export const tripsService = {
  async list(userId: number, paging: Pagination) {
    const where = { userId };
    const [total, trips] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        include: {
          stops: {
            select: {
              dayNumber: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        skip: paging.offset,
        take: paging.limit,
      }),
    ]);

    return {
      items: trips.map(mapTripListItem),
      total,
      limit: paging.limit,
      offset: paging.offset,
    };
  },

  async get(userId: number, tripId: string) {
    const trip = await getOwnedTripWithStops(userId, tripId);
    return mapTripDetail(trip);
  },

  async create(userId: number, body: unknown) {
    const data = tripCreateRequestSchema.parse(body);
    assertDateRange(data.startDate ?? null, data.endDate ?? null);

    const trip = await prisma.trip.create({
      data: {
        userId,
        title: data.title.trim(),
        destination: data.destination.trim(),
        startDate: parseDateInput(data.startDate),
        endDate: parseDateInput(data.endDate),
        budget: data.budget ?? null,
        notes: normalizeOptionalString(data.notes),
      },
      include: {
        stops: {
          orderBy: [{ dayNumber: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return mapTripDetail(trip);
  },

  async update(userId: number, tripId: string, body: unknown) {
    const data = tripUpdateRequestSchema.parse(body);
    const existing = await getOwnedTripWithStops(userId, tripId);

    const nextStartDate = data.startDate ?? formatDateOutput(existing.startDate);
    const nextEndDate = data.endDate ?? formatDateOutput(existing.endDate);
    assertDateRange(nextStartDate, nextEndDate);

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.destination !== undefined ? { destination: data.destination.trim() } : {}),
        ...(data.startDate !== undefined ? { startDate: parseDateInput(data.startDate) } : {}),
        ...(data.endDate !== undefined ? { endDate: parseDateInput(data.endDate) } : {}),
        ...(data.budget !== undefined ? { budget: data.budget } : {}),
        ...(data.notes !== undefined ? { notes: normalizeOptionalString(data.notes) } : {}),
      },
      include: {
        stops: {
          orderBy: [{ dayNumber: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return mapTripDetail(trip);
  },

  async remove(userId: number, tripId: string) {
    await getOwnedTripWithStops(userId, tripId);
    await prisma.trip.delete({ where: { id: tripId } });
  },

  async duplicate(userId: number, tripId: string) {
    const trip = await getOwnedTripWithStops(userId, tripId);
    const duplicated = await prisma.trip.create({
      data: {
        userId,
        title: buildDuplicateTitle(trip.title),
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        notes: trip.notes,
        stops: {
          create: trip.stops.map((stop: TripWithStops["stops"][number]) => ({
            dayNumber: stop.dayNumber,
            orderIndex: stop.orderIndex,
            title: stop.title,
            location: stop.location,
            note: stop.note,
            startTime: stop.startTime,
            endTime: stop.endTime,
          })),
        },
      },
      include: {
        stops: {
          orderBy: [{ dayNumber: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return mapTripDetail(duplicated);
  },

  async createStop(userId: number, tripId: string, body: unknown) {
    const trip = await getOwnedTripWithStops(userId, tripId);
    const data = tripStopCreateRequestSchema.parse(body);
    assertTimeRange(data.startTime ?? null, data.endTime ?? null);

    await prisma.$transaction(async (tx) => {
      const sameDayStops = trip.stops.filter(
        (stop: TripWithStops["stops"][number]) => stop.dayNumber === data.dayNumber
      );
      const created = await tx.tripStop.create({
        data: {
          tripId,
          dayNumber: data.dayNumber,
          orderIndex: sameDayStops.length + 1,
          title: data.title.trim(),
          location: normalizeOptionalString(data.location),
          note: normalizeOptionalString(data.note),
          startTime: data.startTime ?? null,
          endTime: data.endTime ?? null,
        },
      });

      await reorderTripStops(tx, tripId, {
        stopId: created.id,
        targetDay: data.dayNumber,
        targetOrderIndex: data.orderIndex ?? sameDayStops.length + 1,
      });
    });

    return this.get(userId, tripId);
  },

  async updateStop(userId: number, tripId: string, stopId: string, body: unknown) {
    const trip = await getOwnedTripWithStops(userId, tripId);
    const stop = trip.stops.find((item: TripWithStops["stops"][number]) => item.id === stopId);
    if (!stop) {
      throw Object.assign(new Error("TRIP_STOP_NOT_FOUND"), { statusCode: 404 });
    }

    const data = tripStopUpdateRequestSchema.parse(body);
    const nextStartTime = data.startTime ?? stop.startTime;
    const nextEndTime = data.endTime ?? stop.endTime;
    assertTimeRange(nextStartTime, nextEndTime);

    const targetDay = data.dayNumber ?? stop.dayNumber;
    const targetOrderIndex = data.orderIndex ?? stop.orderIndex;

    await prisma.$transaction(async (tx) => {
      await tx.tripStop.update({
        where: { id: stopId },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.location !== undefined
            ? { location: normalizeOptionalString(data.location) }
            : {}),
          ...(data.note !== undefined ? { note: normalizeOptionalString(data.note) } : {}),
          ...(data.startTime !== undefined ? { startTime: data.startTime ?? null } : {}),
          ...(data.endTime !== undefined ? { endTime: data.endTime ?? null } : {}),
        },
      });

      await reorderTripStops(tx, tripId, {
        stopId,
        targetDay,
        targetOrderIndex,
      });
    });

    return this.get(userId, tripId);
  },

  async removeStop(userId: number, tripId: string, stopId: string) {
    const trip = await getOwnedTripWithStops(userId, tripId);
    const stop = trip.stops.find((item: TripWithStops["stops"][number]) => item.id === stopId);
    if (!stop) {
      throw Object.assign(new Error("TRIP_STOP_NOT_FOUND"), { statusCode: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tripStop.delete({ where: { id: stopId } });
      await reorderTripStops(tx, tripId);
    });

    return this.get(userId, tripId);
  },
};
