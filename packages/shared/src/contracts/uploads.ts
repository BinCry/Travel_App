import { z } from "zod";

export const uploadResponseSchema = z.object({
  path: z.string(),
  publicUrl: z.string(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
