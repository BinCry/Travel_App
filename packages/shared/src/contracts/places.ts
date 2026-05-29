import { z } from "zod";
import { placeUpdateSchema } from "./place-updates.js";
import { ownerReviewReplySchema } from "./reviews.js";

export const placeCategorySchema = z.enum(["attractions", "dining", "festivals"]);

export const placeListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  category: placeCategorySchema,
  rating: z.number(),
  ratingCount: z.number().int().nonnegative(),
  featureLabel: z.string(),
  imageUrl: z.string(),
});

export const placeReviewSchema = z.object({
  avatarUrl: z.string().nullable(),
  name: z.string(),
  date: z.string(),
  content: z.string(),
  rating: z.number().int().min(1).max(5),
  imageUrls: z.array(z.string()),
  ownerReply: ownerReviewReplySchema.nullable().optional(),
});

export const placeDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  category: placeCategorySchema,
  rating: z.number(),
  ratingCount: z.number().int().nonnegative(),
  imageUrl: z.string(),
  featureLabel: z.string(),
  about: z.string().optional(),
  priceLevel: z.number().nullable().optional(),
  reviews: z.array(placeReviewSchema),
  updates: z.array(placeUpdateSchema),
  isFavorite: z.boolean().optional(),
});

export type PlaceListItem = z.infer<typeof placeListItemSchema>;
export type PlaceReview = z.infer<typeof placeReviewSchema>;
export type PlaceDetail = z.infer<typeof placeDetailSchema>;
export type PlaceCategory = z.infer<typeof placeCategorySchema>;
