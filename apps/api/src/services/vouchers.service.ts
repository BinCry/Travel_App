import { Prisma, VoucherDiscountType } from "@prisma/client";
import {
  voucherCreateRequestSchema,
  voucherSchema,
  voucherUpdateRequestSchema,
  type Voucher,
} from "@travel-app/shared/contracts/vouchers";
import { prisma } from "../database/client.js";

function normalizeVoucherCode(value: string) {
  return value.trim().toUpperCase();
}

function mapVoucher(voucher: {
  id: string;
  placeId: string;
  optionId: string | null;
  code: string;
  title: string;
  description: string | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
}): Voucher {
  return voucherSchema.parse({
    id: voucher.id,
    placeId: voucher.placeId,
    optionId: voucher.optionId,
    code: voucher.code,
    title: voucher.title,
    description: voucher.description,
    isActive: voucher.isActive,
    startsAt: voucher.startsAt?.toISOString() ?? null,
    endsAt: voucher.endsAt?.toISOString() ?? null,
    usageLimit: voucher.usageLimit,
    usedCount: voucher.usedCount,
    remainingUses:
      voucher.usageLimit != null ? Math.max(0, voucher.usageLimit - voucher.usedCount) : null,
    discountType:
      voucher.discountType === "FIXED_AMOUNT" ? "fixed_amount" : "percentage",
    discountValue: voucher.discountValue,
    maxDiscountAmount: voucher.maxDiscountAmount,
    createdAt: voucher.createdAt.toISOString(),
    updatedAt: voucher.updatedAt.toISOString(),
  });
}

async function assertOwnedPlace(ownerId: number, placeId: string) {
  const place = await prisma.place.findFirst({
    where: { id: placeId, ownerId },
    select: { id: true },
  });

  if (!place) {
    throw Object.assign(new Error("PLACE_NOT_FOUND"), { statusCode: 404 });
  }

  return place;
}

async function assertOwnedOption(ownerId: number, optionId: string, placeId: string) {
  const option = await prisma.bookingOption.findFirst({
    where: {
      id: optionId,
      placeId,
      place: {
        is: {
          ownerId,
        },
      },
    },
    select: { id: true },
  });

  if (!option) {
    throw Object.assign(new Error("BOOKING_OPTION_NOT_FOUND"), { statusCode: 404 });
  }

  return option;
}

async function getOwnedVoucher(ownerId: number, voucherId: string) {
  const voucher = await prisma.voucher.findFirst({
    where: {
      id: voucherId,
      place: {
        is: {
          ownerId,
        },
      },
    },
  });

  if (!voucher) {
    throw Object.assign(new Error("VOUCHER_NOT_FOUND"), { statusCode: 404 });
  }

  return voucher;
}

function parseOptionalDateTime(value?: string | null) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          startsAt: ["INVALID_DATE_TIME"],
        },
      },
    });
  }
  return parsed;
}

function normalizeVoucherDates(startsAt?: string | null, endsAt?: string | null) {
  const parsedStartsAt = parseOptionalDateTime(startsAt);
  const parsedEndsAt = parseOptionalDateTime(endsAt);

  if (parsedStartsAt && parsedEndsAt && parsedStartsAt > parsedEndsAt) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          endsAt: ["END_BEFORE_START"],
        },
      },
    });
  }

  return {
    parsedStartsAt,
    parsedEndsAt,
  };
}

function normalizeDiscountType(value: "fixed_amount" | "percentage") {
  return value === "fixed_amount" ? "FIXED_AMOUNT" : "PERCENTAGE";
}

function validateDiscountValue(
  discountType: "fixed_amount" | "percentage",
  discountValue: number
) {
  if (discountType === "percentage" && discountValue > 100) {
    throw Object.assign(new Error("VALIDATION"), {
      statusCode: 400,
      issues: {
        formErrors: [],
        fieldErrors: {
          discountValue: ["PERCENTAGE_TOO_LARGE"],
        },
      },
    });
  }
}

export const vouchersService = {
  async listOwnerVouchers(ownerId: number, placeId: string) {
    await assertOwnedPlace(ownerId, placeId);
    const vouchers = await prisma.voucher.findMany({
      where: { placeId },
      orderBy: [{ createdAt: "desc" }],
    });
    return vouchers.map(mapVoucher);
  },

  async createOwnerVoucher(ownerId: number, placeId: string, body: unknown) {
    await assertOwnedPlace(ownerId, placeId);
    const data = voucherCreateRequestSchema.parse(body);
    validateDiscountValue(data.discountType, data.discountValue);
    const { parsedStartsAt, parsedEndsAt } = normalizeVoucherDates(data.startsAt, data.endsAt);

    if (data.optionId) {
      await assertOwnedOption(ownerId, data.optionId, placeId);
    }

    try {
      const voucher = await prisma.voucher.create({
        data: {
          placeId,
          optionId: data.optionId ?? null,
          code: normalizeVoucherCode(data.code),
          title: data.title.trim(),
          description: data.description?.trim() || null,
          isActive: data.isActive ?? true,
          startsAt: parsedStartsAt,
          endsAt: parsedEndsAt,
          usageLimit: data.usageLimit ?? null,
          discountType: normalizeDiscountType(data.discountType),
          discountValue: data.discountValue,
          maxDiscountAmount: data.maxDiscountAmount ?? null,
        },
      });
      return mapVoucher(voucher);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw Object.assign(new Error("VOUCHER_CODE_TAKEN"), { statusCode: 409 });
      }
      throw error;
    }
  },

  async updateOwnerVoucher(ownerId: number, voucherId: string, body: unknown) {
    const existing = await getOwnedVoucher(ownerId, voucherId);
    const data = voucherUpdateRequestSchema.parse(body);

    if (data.discountType !== undefined && data.discountValue !== undefined) {
      validateDiscountValue(data.discountType, data.discountValue);
    } else if (data.discountType !== undefined) {
      validateDiscountValue(data.discountType, existing.discountValue);
    } else if (data.discountValue !== undefined) {
      validateDiscountValue(
        existing.discountType === "FIXED_AMOUNT" ? "fixed_amount" : "percentage",
        data.discountValue
      );
    }

    const startsAtValue = data.startsAt !== undefined ? data.startsAt : existing.startsAt?.toISOString();
    const endsAtValue = data.endsAt !== undefined ? data.endsAt : existing.endsAt?.toISOString();
    const { parsedStartsAt, parsedEndsAt } = normalizeVoucherDates(startsAtValue, endsAtValue);

    if (data.optionId !== undefined && data.optionId) {
      await assertOwnedOption(ownerId, data.optionId, existing.placeId);
    }

    try {
      const updated = await prisma.voucher.update({
        where: { id: voucherId },
        data: {
          ...(data.optionId !== undefined ? { optionId: data.optionId ?? null } : {}),
          ...(data.code !== undefined ? { code: normalizeVoucherCode(data.code) } : {}),
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.description !== undefined
            ? { description: data.description?.trim() || null }
            : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.startsAt !== undefined ? { startsAt: parsedStartsAt } : {}),
          ...(data.endsAt !== undefined ? { endsAt: parsedEndsAt } : {}),
          ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit ?? null } : {}),
          ...(data.discountType !== undefined
            ? { discountType: normalizeDiscountType(data.discountType) }
            : {}),
          ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
          ...(data.maxDiscountAmount !== undefined
            ? { maxDiscountAmount: data.maxDiscountAmount ?? null }
            : {}),
        },
      });
      return mapVoucher(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw Object.assign(new Error("VOUCHER_CODE_TAKEN"), { statusCode: 409 });
      }
      throw error;
    }
  },

  async deleteOwnerVoucher(ownerId: number, voucherId: string) {
    const existing = await getOwnedVoucher(ownerId, voucherId);
    await prisma.voucher.delete({
      where: { id: existing.id },
    });
  },
};
