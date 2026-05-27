import type { ApiOk, PlaceListItem } from './types';
import { apiClient } from './client';

export async function fetchFavorites(): Promise<PlaceListItem[]> {
  const res = await apiClient.get<ApiOk<PlaceListItem[]>>('/users/me/favorites');
  return res.data.data;
}

export async function addFavorite(placeId: string): Promise<void> {
  await apiClient.post(`/users/me/favorites/places/${placeId}`);
}

export async function removeFavorite(placeId: string): Promise<void> {
  await apiClient.delete(`/users/me/favorites/places/${placeId}`);
}
