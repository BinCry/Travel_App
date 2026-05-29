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
  durationMinutes: z.number().int().positive(),
  maxPartySize: z.number().int().positive(),
  isActive: z.boolean(),
  slots: z.array(availabilitySlotSchema),
});

export const bookingOptionCreateRequestSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  priceLabel: z.string().max(120).optional().nullable(),
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
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  canCancel: z.boolean(),
});

export const ownerPlaceBookingSchema = travelerBookingSchema.extend({
  travelerName: z.string(),
  travelerEmail: z.string().email(),
});

export const ownerBookingStatusUpdateRequestSchema = z.object({
  status: bookingStatusSchema,
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
export type TravelerBooking = z.infer<typeof travelerBookingSchema>;
export type OwnerPlaceBooking = z.infer<typeof ownerPlaceBookingSchema>;
export type OwnerBookingStatusUpdateRequest = z.infer<
  typeof ownerBookingStatusUpdateRequestSchema
>;
