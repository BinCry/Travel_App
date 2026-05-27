import {
  authResponseSchema,
  forgotPasswordResponseSchema,
  forgotPasswordVerifyResponseSchema,
  registerPendingResponseSchema,
  resendVerificationResponseSchema,
  resetPasswordResponseSchema,
  verifyEmailResponseSchema,
} from '@travel-app/shared/contracts/auth';
import type {
  AuthResponse,
  ForgotPasswordResponse,
  ForgotPasswordVerifyResponse,
  RegisterPendingResponse,
  ResendVerificationResponse,
  ResetPasswordResponse,
  VerifyEmailResponse,
} from './types';
import { apiClient, parseApiData, setAccessToken } from './client';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/login', { email, password });
  const data = parseApiData(res.data, authResponseSchema);
  await setAccessToken(data.accessToken);
  return data;
}

export async function register(
  email: string,
  password: string,
  fullName?: string,
  role?: "traveler" | "owner"
): Promise<RegisterPendingResponse> {
  const res = await apiClient.post('/auth/register', {
    email,
    password,
    fullName,
    role,
  });
  return parseApiData(res.data, registerPendingResponseSchema);
}

export async function verifyEmail(email: string, otp: string): Promise<VerifyEmailResponse> {
  const res = await apiClient.post('/auth/register/verify', {
    email,
    otp,
  });
  const data = parseApiData(res.data, verifyEmailResponseSchema);
  await setAccessToken(data.accessToken);
  return data;
}

export async function resendVerificationOtp(
  email: string
): Promise<ResendVerificationResponse> {
  const res = await apiClient.post('/auth/register/resend-otp', {
    email,
  });
  return parseApiData(res.data, resendVerificationResponseSchema);
}

export async function logout(): Promise<void> {
  await setAccessToken(null);
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const res = await apiClient.post('/auth/forgot-password', {
    email,
  });
  return parseApiData(res.data, forgotPasswordResponseSchema);
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string
): Promise<ForgotPasswordVerifyResponse> {
  const res = await apiClient.post('/auth/forgot-password/verify', {
    email,
    otp,
  });
  return parseApiData(res.data, forgotPasswordVerifyResponseSchema);
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResponse> {
  const res = await apiClient.post('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return parseApiData(res.data, resetPasswordResponseSchema);
}
