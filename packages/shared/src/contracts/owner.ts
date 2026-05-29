import { z } from "zod";
import { placeCategorySchema } from "./places.js";

export const promotionScheduleInputSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  days: z.array(z.string()),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  specificTime: z.boolean().optional(),
});

export const promotionScheduleSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  days: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
  specificTime: z.boolean(),
});

export const ownerPromotionCreateRequestSchema = z.object({
  title: z.string().min(1).max(200),
  isActive: z.boolean().optional(),
  schedule: promotionScheduleInputSchema,
});

export const ownerPromotionUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
  schedule: promotionScheduleInputSchema.partial().optional(),
});

export const promotionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  isActive: z.boolean(),
  schedule: promotionScheduleSchema,
});

export const ownerPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  imageUrl: z.string(),
});

export const ownerPlaceCreateRequestSchema = z.object({
  name: z.string().min(1).max(200),
  region: z.string().min(1).max(200),
  category: placeCategorySchema,
  about: z.string().optional(),
  coverImageUrl: z.string().url(),
  featureLabel: z.string().optional(),
  priceLevel: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  promotions: z.array(ownerPromotionCreateRequestSchema).optional(),
});

export const ownerPlaceUpdateRequestSchema = ownerPlaceCreateRequestSchema.partial();

export const ownerPlaceDetailSchema = ownerPlaceSchema.extend({
  category: placeCategorySchema,
  about: z.string(),
  featureLabel: z.string(),
  priceLevel: z.number().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  promotions: z.array(promotionItemSchema),
});

export const ownerAnalyticsTopPlaceSchema = z.object({
  placeId: z.string(),
  placeName: z.string(),
  bookingCount: z.number().int().nonnegative(),
  reviewCount: z.number().int().nonnegative(),
  favoriteCount: z.number().int().nonnegative(),
  activePromotionCount: z.number().int().nonnegative(),
  averageRating: z.number().nonnegative(),
});

export const ownerAnalyticsSummarySchema = z.object({
  placeCount: z.number().int().nonnegative(),
  activePromotionCount: z.number().int().nonnegative(),
  totalBookingCount: z.number().int().nonnegative(),
  pendingBookingCount: z.number().int().nonnegative(),
  confirmedBookingCount: z.number().int().nonnegative(),
  completedBookingCount: z.number().int().nonnegative(),
  reviewCount: z.number().int().nonnegative(),
  favoriteCount: z.number().int().nonnegative(),
  averageRating: z.number().nonnegative(),
  topPlaces: z.array(ownerAnalyticsTopPlaceSchema),
});

export type PromotionItem = z.infer<typeof promotionItemSchema>;
export type PromotionScheduleInput = z.infer<typeof promotionScheduleInputSchema>;
export type PromotionSchedule = z.infer<typeof promotionScheduleSchema>;
export type OwnerPromotionCreateRequest = z.infer<typeof ownerPromotionCreateRequestSchema>;
export type OwnerPromotionUpdateRequest = z.infer<typeof ownerPromotionUpdateRequestSchema>;
export type OwnerPlace = z.infer<typeof ownerPlaceSchema>;
export type OwnerPlaceCreateRequest = z.infer<typeof ownerPlaceCreateRequestSchema>;
export type OwnerPlaceUpdateRequest = z.infer<typeof ownerPlaceUpdateRequestSchema>;
export type OwnerPlaceDetail = z.infer<typeof ownerPlaceDetailSchema>;
export type OwnerAnalyticsTopPlace = z.infer<typeof ownerAnalyticsTopPlaceSchema>;
export type OwnerAnalyticsSummary = z.infer<typeof ownerAnalyticsSummarySchema>;
