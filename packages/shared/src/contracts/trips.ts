import { z } from "zod";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export const tripBudgetSchema = z.enum(["budget", "balanced", "premium"]);

export const tripDateSchema = z
  .string()
  .regex(isoDatePattern, "INVALID_DATE");

export const tripTimeSchema = z
  .string()
  .regex(timePattern, "INVALID_TIME");

export const tripStopSchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().min(1),
  orderIndex: z.number().int().min(1),
  title: z.string(),
  location: z.string().nullable(),
  note: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

export const tripListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  destination: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  budget: tripBudgetSchema.nullable(),
  notes: z.string().nullable(),
  stopCount: z.number().int().nonnegative(),
  dayCount: z.number().int().nonnegative(),
  updatedAt: z.string(),
});

export const tripDetailSchema = tripListItemSchema.extend({
  stops: z.array(tripStopSchema),
});

const tripBaseRequestSchema = z.object({
  title: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(120),
  startDate: tripDateSchema.nullable().optional(),
  endDate: tripDateSchema.nullable().optional(),
  budget: tripBudgetSchema.nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const tripCreateRequestSchema = tripBaseRequestSchema.superRefine((value, ctx) => {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "END_DATE_BEFORE_START_DATE",
      path: ["endDate"],
    });
  }
});

export const tripUpdateRequestSchema = tripBaseRequestSchema
  .partial()
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "END_DATE_BEFORE_START_DATE",
        path: ["endDate"],
      });
    }
  });

const tripStopBaseRequestSchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
  startTime: tripTimeSchema.nullable().optional(),
  endTime: tripTimeSchema.nullable().optional(),
  orderIndex: z.number().int().min(1).optional(),
});

export const tripStopCreateRequestSchema = tripStopBaseRequestSchema.superRefine((value, ctx) => {
  if (value.startTime && value.endTime && value.startTime > value.endTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "END_TIME_BEFORE_START_TIME",
      path: ["endTime"],
    });
  }
});

export const tripStopUpdateRequestSchema = tripStopBaseRequestSchema
  .partial()
  .superRefine((value, ctx) => {
    if (value.startTime && value.endTime && value.startTime > value.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "END_TIME_BEFORE_START_TIME",
        path: ["endTime"],
      });
    }
  });

export type TripBudget = z.infer<typeof tripBudgetSchema>;
export type TripStop = z.infer<typeof tripStopSchema>;
export type TripListItem = z.infer<typeof tripListItemSchema>;
export type TripDetail = z.infer<typeof tripDetailSchema>;
export type TripCreateRequest = z.infer<typeof tripCreateRequestSchema>;
export type TripUpdateRequest = z.infer<typeof tripUpdateRequestSchema>;
export type TripStopCreateRequest = z.infer<typeof tripStopCreateRequestSchema>;
export type TripStopUpdateRequest = z.infer<typeof tripStopUpdateRequestSchema>;
