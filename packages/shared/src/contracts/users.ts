import { z } from "zod";
import { passwordSchema } from "./auth.js";

export const updateMeRequestSchema = z.object({
  fullName: z.string().optional(),
  username: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const changePasswordResponseSchema = z.object({
  message: z.string(),
});

export const deleteAccountRequestSchema = z.object({
  currentPassword: z.string().min(1),
});

export const deleteAccountResponseSchema = z.object({
  message: z.string(),
});

export type UpdateMeRequest = z.infer<typeof updateMeRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
export type DeleteAccountRequest = z.infer<typeof deleteAccountRequestSchema>;
export type DeleteAccountResponse = z.infer<typeof deleteAccountResponseSchema>;
