import { z } from 'zod';
import { placeCategorySchema, placeDetailSchema, placeListItemSchema } from '@travel-app/shared/contracts/places';
import type { PlaceCategory, PlaceDetail, PlaceListItem } from './types';
import { apiClient, parseApiData } from './client';

export async function fetchPlaces(category: PlaceCategory): Promise<PlaceListItem[]> {
  placeCategorySchema.parse(category);
  const res = await apiClient.get('/places', {
    params: { category, limit: 50 },
  });
  return parseApiData(res.data, z.array(placeListItemSchema));
}

export async function fetchPlaceDetail(placeId: string): Promise<PlaceDetail> {
  const res = await apiClient.get(`/places/${placeId}`);
  return parseApiData(res.data, placeDetailSchema);
}
