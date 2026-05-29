import { z } from 'zod';
import {
  collectionCreateRequestSchema,
  collectionDetailSchema,
  collectionSummarySchema,
  collectionUpdateRequestSchema,
} from '@travel-app/shared/contracts/collections';
import type {
  CollectionCreateRequest,
  CollectionDetail,
  CollectionSummary,
  CollectionUpdateRequest,
} from './types';
import { apiClient, parseApiData } from './client';

export async function fetchCollections(placeId?: string): Promise<CollectionSummary[]> {
  const res = await apiClient.get('/collections', {
    params: placeId ? { placeId } : undefined,
  });
  return parseApiData(res.data, z.array(collectionSummarySchema));
}

export async function createCollection(
  body: CollectionCreateRequest
): Promise<CollectionSummary> {
  const res = await apiClient.post('/collections', collectionCreateRequestSchema.parse(body));
  return parseApiData(res.data, collectionSummarySchema);
}

export async function fetchCollectionDetail(collectionId: string): Promise<CollectionDetail> {
  const res = await apiClient.get(`/collections/${collectionId}`);
  return parseApiData(res.data, collectionDetailSchema);
}

export async function updateCollection(
  collectionId: string,
  body: CollectionUpdateRequest
): Promise<CollectionSummary> {
  const res = await apiClient.patch(
    `/collections/${collectionId}`,
    collectionUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, collectionSummarySchema);
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await apiClient.delete(`/collections/${collectionId}`);
}

export async function addPlaceToCollection(
  collectionId: string,
  placeId: string
): Promise<void> {
  await apiClient.post(`/collections/${collectionId}/places`, { placeId });
}

export async function removePlaceFromCollection(
  collectionId: string,
  placeId: string
): Promise<void> {
  await apiClient.delete(`/collections/${collectionId}/places/${placeId}`);
}
