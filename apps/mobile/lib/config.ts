import Constants from 'expo-constants';
import { Platform } from 'react-native';

function defaultApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

function getExpoLanApiBaseUrl(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();
  if (!host) {
    return null;
  }

  return `http://${host}:8000`;
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/$/, '');
}

function resolveConfiguredApiBaseUrl(): string | null {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined);

  if (!configured) {
    return null;
  }

  if (configured.trim().toLowerCase() === 'auto') {
    return getExpoLanApiBaseUrl();
  }

  return normalizeApiBaseUrl(configured);
}

export const API_BASE_URL =
  resolveConfiguredApiBaseUrl() ||
  getExpoLanApiBaseUrl() ||
  defaultApiBaseUrl();

export const API_V1 = `${API_BASE_URL}/api/v1`;
