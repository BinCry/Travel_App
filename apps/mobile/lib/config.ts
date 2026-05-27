import Constants from 'expo-constants';
import { Platform } from 'react-native';

function defaultApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ||
  defaultApiBaseUrl();

export const API_V1 = `${API_BASE_URL}/api/v1`;
