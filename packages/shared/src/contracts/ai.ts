import { z } from "zod";

export const tripPlanRequestSchema = z.object({
  query: z.string().min(1).max(500),
  location: z.string().optional(),
});

export const tripPlanSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.string(),
});

export const tripPlanResponseSchema = z.object({
  query: z.string(),
  location: z.string(),
  suggestions: z.array(tripPlanSuggestionSchema),
  note: z.string(),
});

export type TripPlanRequest = z.infer<typeof tripPlanRequestSchema>;
export type TripPlanResponse = z.infer<typeof tripPlanResponseSchema>;
