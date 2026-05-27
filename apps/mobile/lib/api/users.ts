import { apiUserSchema } from '@travel-app/shared/contracts/auth';
import {
  changePasswordResponseSchema,
  deleteAccountResponseSchema,
} from '@travel-app/shared/contracts/users';
import type {
  ApiUser,
  ChangePasswordResponse,
  DeleteAccountResponse,
  UpdateMeRequest,
} from './types';
import { apiClient, parseApiData } from './client';

export async function fetchMe(): Promise<ApiUser> {
  const res = await apiClient.get('/users/me');
  return parseApiData(res.data, apiUserSchema);
}

export async function updateMe(body: UpdateMeRequest): Promise<ApiUser> {
  const res = await apiClient.patch('/users/me', body);
  return parseApiData(res.data, apiUserSchema);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  const res = await apiClient.post('/users/me/change-password', {
    currentPassword,
    newPassword,
  });
  return parseApiData(res.data, changePasswordResponseSchema);
}

export async function deleteAccount(
  currentPassword: string
): Promise<DeleteAccountResponse> {
  const res = await apiClient.post('/users/me/delete', {
    currentPassword,
  });
  return parseApiData(res.data, deleteAccountResponseSchema);
}
