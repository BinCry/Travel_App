import { z } from "zod";

export const passwordSchema = z.string().min(8).max(72);
export const otpCodeSchema = z.string().regex(/^\d{6}$/);
export const apiUserRoleSchema = z.enum(["traveler", "owner"]);

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  fullName: z.string().min(1).optional(),
  role: apiUserRoleSchema.optional().default("traveler"),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordVerifyRequestSchema = z.object({
  email: z.string().email(),
  otp: otpCodeSchema,
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
  otp: otpCodeSchema,
  newPassword: passwordSchema,
});

export const verifyEmailRequestSchema = z.object({
  email: z.string().email(),
  otp: otpCodeSchema,
});

export const resendVerificationRequestSchema = z.object({
  email: z.string().email(),
});

export const apiUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  fullName: z.string().nullable(),
  username: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  location: z.string().nullable(),
  name: z.string(),
  role: apiUserRoleSchema,
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: apiUserSchema,
});

export const registerPendingResponseSchema = z.object({
  email: z.string().email(),
  message: z.string(),
});

export const verifyEmailResponseSchema = authResponseSchema.extend({
  message: z.string(),
});

export const resendVerificationResponseSchema = z.object({
  message: z.string(),
});

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export const forgotPasswordVerifyResponseSchema = z.object({
  message: z.string(),
});

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ForgotPasswordVerifyRequest = z.infer<typeof forgotPasswordVerifyRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type ResendVerificationRequest = z.infer<typeof resendVerificationRequestSchema>;
export type ApiUserRole = z.infer<typeof apiUserRoleSchema>;
export type ApiUser = z.infer<typeof apiUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RegisterPendingResponse = z.infer<typeof registerPendingResponseSchema>;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
export type ResendVerificationResponse = z.infer<typeof resendVerificationResponseSchema>;
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;
export type ForgotPasswordVerifyResponse = z.infer<typeof forgotPasswordVerifyResponseSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
