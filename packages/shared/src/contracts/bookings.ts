import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
  "REFUND_PENDING",
  "REFUNDED",
]);

export const bookingCurrencySchema = z.string().trim().min(3).max(8);

export const availabilitySlotSchema = z.object({
  id: z.string(),
  optionId: z.string(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  dateLabel: z.string(),
  timeLabel: z.string(),
  capacity: z.number().int().positive(),
  remainingCapacity: z.number().int().nonnegative(),
  isActive: z.boolean(),
  isBookable: z.boolean(),
});

export const bookingOptionSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priceLabel: z.string().nullable(),
  basePriceAmount: z.number().int().nonnegative(),
  currency: bookingCurrencySchema,
  durationMinutes: z.number().int().positive(),
  maxPartySize: z.number().int().positive(),
  isActive: z.boolean(),
  slots: z.array(availabilitySlotSchema),
});

export const bookingOptionCreateRequestSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  priceLabel: z.string().max(120).optional().nullable(),
  basePriceAmount: z.number().int().min(0).max(1_000_000_000),
  currency: bookingCurrencySchema.optional(),
  durationMinutes: z.number().int().min(15).max(1440),
  maxPartySize: z.number().int().min(1).max(100),
  isActive: z.boolean().optional(),
});

export const bookingOptionUpdateRequestSchema = bookingOptionCreateRequestSchema.partial();

export const availabilitySlotCreateRequestSchema = z.object({
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  capacity: z.number().int().min(1).max(500),
  isActive: z.boolean().optional(),
});

export const availabilitySlotUpdateRequestSchema =
  availabilitySlotCreateRequestSchema.partial();

export const bookingCreateRequestSchema = z.object({
  slotId: z.string().min(1),
  partySize: z.number().int().min(1).max(100),
  note: z.string().max(500).optional().nullable(),
  voucherCode: z.string().trim().max(64).optional().nullable(),
});

export const travelerBookingCancelRequestSchema = z.object({
  cancellationReason: z.string().trim().max(500).optional().nullable(),
});

export const bookingQuoteRequestSchema = bookingCreateRequestSchema;

export const bookingStatusHistoryEntrySchema = z.object({
  id: z.string(),
  status: bookingStatusSchema,
  note: z.string().nullable(),
  actorRole: z.enum(["traveler", "owner", "system"]).nullable(),
  actorUserId: z.number().int().nullable(),
  actorName: z.string().nullable(),
  createdAt: z.string().min(1),
});

export const bookingQuoteSchema = z.object({
  slotId: z.string(),
  optionId: z.string(),
  placeId: z.string(),
  partySize: z.number().int().positive(),
  unitPriceAmount: z.number().int().nonnegative(),
  subtotalAmount: z.number().int().nonnegative(),
  discountAmount: z.number().int().nonnegative(),
  finalAmount: z.number().int().nonnegative(),
  currency: bookingCurrencySchema,
  appliedVoucherCode: z.string().nullable(),
  appliedVoucherTitle: z.string().nullable(),
});

export const travelerBookingSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  placeName: z.string(),
  placeImageUrl: z.string(),
  optionId: z.string(),
  optionTitle: z.string(),
  slotId: z.string(),
  slotDateLabel: z.string(),
  slotTimeLabel: z.string(),
  slotStartAt: z.string().min(1),
  slotEndAt: z.string().min(1),
  partySize: z.number().int().positive(),
  note: z.string().nullable(),
  status: bookingStatusSchema,
  unitPriceAmount: z.number().int().nonnegative(),
  subtotalAmount: z.number().int().nonnegative(),
  discountAmount: z.number().int().nonnegative(),
  finalAmount: z.number().int().nonnegative(),
  currency: bookingCurrencySchema,
  appliedVoucherCode: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  canCancel: z.boolean(),
});

export const travelerBookingDetailSchema = travelerBookingSchema.extend({
  cancellationReason: z.string().nullable(),
  ownerDecisionNote: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  confirmedAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  noShowAt: z.string().nullable(),
  refundPendingAt: z.string().nullable(),
  refundedAt: z.string().nullable(),
  history: z.array(bookingStatusHistoryEntrySchema),
});

export const ownerPlaceBookingSchema = travelerBookingSchema.extend({
  travelerName: z.string(),
  travelerEmail: z.string().email(),
});

export const ownerBookingDetailSchema = ownerPlaceBookingSchema.extend({
  cancellationReason: z.string().nullable(),
  ownerDecisionNote: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  confirmedAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  noShowAt: z.string().nullable(),
  refundPendingAt: z.string().nullable(),
  refundedAt: z.string().nullable(),
  history: z.array(bookingStatusHistoryEntrySchema),
});

export const ownerBookingStatusUpdateRequestSchema = z.object({
  status: bookingStatusSchema,
  ownerDecisionNote: z.string().trim().max(500).optional().nullable(),
  cancellationReason: z.string().trim().max(500).optional().nullable(),
});

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type BookingOption = z.infer<typeof bookingOptionSchema>;
export type BookingOptionCreateRequest = z.infer<
  typeof bookingOptionCreateRequestSchema
>;
export type BookingOptionUpdateRequest = z.infer<
  typeof bookingOptionUpdateRequestSchema
>;
export type AvailabilitySlotCreateRequest = z.infer<
  typeof availabilitySlotCreateRequestSchema
>;
export type AvailabilitySlotUpdateRequest = z.infer<
  typeof availabilitySlotUpdateRequestSchema
>;
export type BookingCreateRequest = z.infer<typeof bookingCreateRequestSchema>;
export type TravelerBookingCancelRequest = z.infer<
  typeof travelerBookingCancelRequestSchema
>;
export type BookingQuoteRequest = z.infer<typeof bookingQuoteRequestSchema>;
export type BookingQuote = z.infer<typeof bookingQuoteSchema>;
export type BookingStatusHistoryEntry = z.infer<
  typeof bookingStatusHistoryEntrySchema
>;
export type TravelerBooking = z.infer<typeof travelerBookingSchema>;
export type TravelerBookingDetail = z.infer<typeof travelerBookingDetailSchema>;
export type OwnerPlaceBooking = z.infer<typeof ownerPlaceBookingSchema>;
export type OwnerBookingDetail = z.infer<typeof ownerBookingDetailSchema>;
export type OwnerBookingStatusUpdateRequest = z.infer<
  typeof ownerBookingStatusUpdateRequestSchema
>;
