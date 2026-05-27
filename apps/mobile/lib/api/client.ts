import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { paginationMetaSchema } from '@travel-app/shared/common';
import { z } from 'zod';
import { API_V1 } from '../config';

const TOKEN_KEY = 'travel_app_access_token';

export const apiClient = axios.create({
  baseURL: API_V1,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function setAccessToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function parseApiData<T>(payload: unknown, schema: z.ZodType<T>): T {
  const envelope = z
    .object({
      ok: z.literal(true),
      data: z.unknown(),
    })
    .parse(payload);
  return schema.parse(envelope.data);
}

export function parseApiDataWithMeta<T>(payload: unknown, schema: z.ZodType<T>) {
  const envelope = z
    .object({
    ok: z.literal(true),
      data: z.unknown(),
      meta: paginationMetaSchema.optional(),
    })
    .parse(payload);
  return {
    ...envelope,
    data: schema.parse(envelope.data),
  };
}

export function getApiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'INTERNAL';
}
