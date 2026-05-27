import { z } from "zod";

export const reviewCreateRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1).max(8000),
  imageUrls: z.array(z.string().url()).optional(),
});

export const reviewUpdateRequestSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    content: z.string().min(1).max(8000).optional(),
    imageUrls: z.array(z.string().url()).optional(),
  })
  .refine(
    (payload) =>
      payload.rating !== undefined ||
      payload.content !== undefined ||
      payload.imageUrls !== undefined,
    { message: "EMPTY_UPDATE" }
  );

export const reviewListItemSchema = z.object({
  id: z.string(),
  username: z.string(),
  rating: z.number().int().min(1).max(5),
  date: z.string(),
  content: z.string(),
  avatarUrl: z.string().nullable(),
  imageUrls: z.array(z.string()),
  likes: z.number().int().nonnegative(),
});

export const userReviewListItemSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  placeName: z.string(),
  placeImageUrl: z.string(),
  placeRegion: z.string(),
  rating: z.number().int().min(1).max(5),
  date: z.string(),
  content: z.string(),
  imageUrls: z.array(z.string()),
  likes: z.number().int().nonnegative(),
});

export const reviewLikeToggleSchema = z.object({
  liked: z.boolean(),
  likes: z.number().int().nonnegative(),
});

export const reviewMutationResultSchema = z.object({
  id: z.string(),
});

export type ReviewCreateRequest = z.infer<typeof reviewCreateRequestSchema>;
export type ReviewUpdateRequest = z.infer<typeof reviewUpdateRequestSchema>;
export type ReviewListItem = z.infer<typeof reviewListItemSchema>;
export type UserReviewListItem = z.infer<typeof userReviewListItemSchema>;
export type ReviewLikeToggleResponse = z.infer<typeof reviewLikeToggleSchema>;
export type ReviewMutationResult = z.infer<typeof reviewMutationResultSchema>;
