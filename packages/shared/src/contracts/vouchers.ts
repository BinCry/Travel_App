import { z } from "zod";

export const voucherDiscountTypeSchema = z.enum(["fixed_amount", "percentage"]);

export const voucherSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  optionId: z.string().nullable(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  usageLimit: z.number().int().positive().nullable(),
  usedCount: z.number().int().nonnegative(),
  remainingUses: z.number().int().nonnegative().nullable(),
  discountType: voucherDiscountTypeSchema,
  discountValue: z.number().int().positive(),
  maxDiscountAmount: z.number().int().positive().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const voucherCreateRequestSchema = z.object({
  optionId: z.string().min(1).optional().nullable(),
  code: z.string().trim().min(3).max(64),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  startsAt: z.string().min(1).optional().nullable(),
  endsAt: z.string().min(1).optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  discountType: voucherDiscountTypeSchema,
  discountValue: z.number().int().positive(),
  maxDiscountAmount: z.number().int().positive().optional().nullable(),
});

export const voucherUpdateRequestSchema = voucherCreateRequestSchema.partial();

export type Voucher = z.infer<typeof voucherSchema>;
export type VoucherDiscountType = z.infer<typeof voucherDiscountTypeSchema>;
export type VoucherCreateRequest = z.infer<typeof voucherCreateRequestSchema>;
export type VoucherUpdateRequest = z.infer<typeof voucherUpdateRequestSchema>;
