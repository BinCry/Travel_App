import { z } from 'zod';
import {
  ownerPlaceCreateRequestSchema,
  ownerPlaceDetailSchema,
  ownerPlaceSchema,
  ownerPlaceUpdateRequestSchema,
  ownerPromotionCreateRequestSchema,
  ownerPromotionUpdateRequestSchema,
  promotionItemSchema,
} from '@travel-app/shared/contracts/owner';
import type {
  OwnerPlace,
  OwnerPlaceCreateRequest,
  OwnerPlaceDetail,
  OwnerPlaceUpdateRequest,
  OwnerPromotionCreateRequest,
  OwnerPromotionUpdateRequest,
  PromotionItem,
} from './types';
import { apiClient, parseApiData } from './client';

export type { OwnerPlace, OwnerPlaceDetail, PromotionItem } from './types';

export async function fetchOwnerPlaces(): Promise<OwnerPlace[]> {
  const res = await apiClient.get('/owner/places');
  return parseApiData(res.data, z.array(ownerPlaceSchema));
}

export async function fetchOwnerPlace(placeId: string): Promise<OwnerPlaceDetail> {
  const res = await apiClient.get(`/owner/places/${placeId}`);
  return parseApiData(res.data, ownerPlaceDetailSchema);
}

export async function createOwnerPlace(body: OwnerPlaceCreateRequest): Promise<OwnerPlace> {
  const res = await apiClient.post('/owner/places', ownerPlaceCreateRequestSchema.parse(body));
  return parseApiData(res.data, ownerPlaceSchema);
}

export async function updateOwnerPlace(
  placeId: string,
  body: OwnerPlaceUpdateRequest
): Promise<OwnerPlace> {
  const res = await apiClient.patch(
    `/owner/places/${placeId}`,
    ownerPlaceUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, ownerPlaceSchema);
}

export async function deleteOwnerPlace(placeId: string): Promise<void> {
  await apiClient.delete(`/owner/places/${placeId}`);
}

export async function fetchPlacePromotions(placeId: string): Promise<PromotionItem[]> {
  const res = await apiClient.get(`/owner/places/${placeId}/promotions`);
  return parseApiData(res.data, z.array(promotionItemSchema));
}

export async function createPromotion(
  placeId: string,
  body: OwnerPromotionCreateRequest
): Promise<PromotionItem> {
  const res = await apiClient.post(
    `/owner/places/${placeId}/promotions`,
    ownerPromotionCreateRequestSchema.parse(body)
  );
  return parseApiData(res.data, promotionItemSchema);
}

export async function updatePromotion(
  promotionId: string,
  body: OwnerPromotionUpdateRequest
): Promise<PromotionItem> {
  const res = await apiClient.patch(
    `/owner/promotions/${promotionId}`,
    ownerPromotionUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, promotionItemSchema);
}

export async function togglePromotion(promotionId: string): Promise<PromotionItem> {
  const res = await apiClient.post(`/owner/promotions/${promotionId}/toggle`);
  return parseApiData(res.data, promotionItemSchema);
}

export async function deletePromotion(promotionId: string): Promise<void> {
  await apiClient.delete(`/owner/promotions/${promotionId}`);
}
