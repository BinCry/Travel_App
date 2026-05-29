import { z } from "zod";
import { placeListItemSchema } from "./places.js";

export const collectionCreateRequestSchema = z.object({
  title: z.string().min(1).max(80),
  isPublic: z.boolean().optional(),
});

export const collectionUpdateRequestSchema = collectionCreateRequestSchema
  .partial()
  .refine((value) => value.title !== undefined || value.isPublic !== undefined, {
    message: "At least one field must be provided",
  });

export const collectionPlaceMutationRequestSchema = z.object({
  placeId: z.string().min(1),
});

export const collectionSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  isPublic: z.boolean(),
  placeCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  containsPlace: z.boolean().optional(),
});

export const collectionPlaceItemSchema = placeListItemSchema.extend({
  addedAt: z.string().datetime(),
});

export const collectionDetailSchema = collectionSummarySchema.extend({
  places: z.array(collectionPlaceItemSchema),
});

export type CollectionCreateRequest = z.infer<typeof collectionCreateRequestSchema>;
export type CollectionUpdateRequest = z.infer<typeof collectionUpdateRequestSchema>;
export type CollectionPlaceMutationRequest = z.infer<
  typeof collectionPlaceMutationRequestSchema
>;
export type CollectionSummary = z.infer<typeof collectionSummarySchema>;
export type CollectionPlaceItem = z.infer<typeof collectionPlaceItemSchema>;
export type CollectionDetail = z.infer<typeof collectionDetailSchema>;
