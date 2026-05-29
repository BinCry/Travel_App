import { z } from 'zod';
import {
  tripCreateRequestSchema,
  tripDetailSchema,
  tripListItemSchema,
  tripStopCreateRequestSchema,
  tripStopUpdateRequestSchema,
  tripUpdateRequestSchema,
} from '@travel-app/shared/contracts/trips';
import type {
  TripCreateRequest,
  TripDetail,
  TripListItem,
  TripStopCreateRequest,
  TripStopUpdateRequest,
  TripUpdateRequest,
} from './types';
import { apiClient, parseApiData } from './client';

export async function fetchTrips(): Promise<TripListItem[]> {
  const res = await apiClient.get('/trips', {
    params: { limit: 50 },
  });
  return parseApiData(res.data, z.array(tripListItemSchema));
}

export async function fetchTrip(tripId: string): Promise<TripDetail> {
  const res = await apiClient.get(`/trips/${tripId}`);
  return parseApiData(res.data, tripDetailSchema);
}

export async function createTrip(body: TripCreateRequest): Promise<TripDetail> {
  const res = await apiClient.post('/trips', tripCreateRequestSchema.parse(body));
  return parseApiData(res.data, tripDetailSchema);
}

export async function updateTrip(
  tripId: string,
  body: TripUpdateRequest
): Promise<TripDetail> {
  const res = await apiClient.patch(`/trips/${tripId}`, tripUpdateRequestSchema.parse(body));
  return parseApiData(res.data, tripDetailSchema);
}

export async function deleteTrip(tripId: string): Promise<void> {
  await apiClient.delete(`/trips/${tripId}`);
}

export async function duplicateTrip(tripId: string): Promise<TripDetail> {
  const res = await apiClient.post(`/trips/${tripId}/duplicate`);
  return parseApiData(res.data, tripDetailSchema);
}

export async function createTripStop(
  tripId: string,
  body: TripStopCreateRequest
): Promise<TripDetail> {
  const res = await apiClient.post(
    `/trips/${tripId}/stops`,
    tripStopCreateRequestSchema.parse(body)
  );
  return parseApiData(res.data, tripDetailSchema);
}

export async function updateTripStop(
  tripId: string,
  stopId: string,
  body: TripStopUpdateRequest
): Promise<TripDetail> {
  const res = await apiClient.patch(
    `/trips/${tripId}/stops/${stopId}`,
    tripStopUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, tripDetailSchema);
}

export async function deleteTripStop(tripId: string, stopId: string): Promise<TripDetail> {
  const res = await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
  return parseApiData(res.data, tripDetailSchema);
}
