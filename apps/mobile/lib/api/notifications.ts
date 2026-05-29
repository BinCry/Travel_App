import { z } from 'zod';
import { notificationSchema } from '@travel-app/shared/contracts/notifications';
import type { NotificationItem } from './types';
import { apiClient, parseApiData } from './client';

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get('/notifications');
  return parseApiData(res.data, z.array(notificationSchema));
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationItem> {
  const res = await apiClient.post(`/notifications/${notificationId}/read`);
  return parseApiData(res.data, notificationSchema);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}
