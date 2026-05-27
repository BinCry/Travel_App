import { z } from 'zod';
import { placeListItemSchema, type PlaceListItem } from '@travel-app/shared/contracts/places';
import { apiClient, parseApiData } from './client';

export async function fetchFavorites(): Promise<PlaceListItem[]> {
  const res = await apiClient.get('/users/me/favorites');
  return parseApiData(res.data, z.array(placeListItemSchema));
}

export async function addFavorite(placeId: string): Promise<void> {
  await apiClient.post(`/users/me/favorites/places/${placeId}`);
}

export async function removeFavorite(placeId: string): Promise<void> {
  await apiClient.delete(`/users/me/favorites/places/${placeId}`);
}
