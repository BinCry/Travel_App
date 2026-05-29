import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "review_reply",
  "booking_status",
  "place_update",
]);

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  payload: z.unknown().nullable().optional(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationItem = z.infer<typeof notificationSchema>;
