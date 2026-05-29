import { z } from "zod";

export const placeUpdateSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  ownerName: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const placeUpdateCreateRequestSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(1000),
});

export const placeUpdateUpdateRequestSchema = placeUpdateCreateRequestSchema.partial().refine(
  (value) => value.title !== undefined || value.content !== undefined,
  {
    message: "At least one field must be provided",
  }
);

export type PlaceUpdate = z.infer<typeof placeUpdateSchema>;
export type PlaceUpdateCreateRequest = z.infer<typeof placeUpdateCreateRequestSchema>;
export type PlaceUpdateUpdateRequest = z.infer<typeof placeUpdateUpdateRequestSchema>;
