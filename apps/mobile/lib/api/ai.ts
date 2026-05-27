import { tripPlanRequestSchema, tripPlanResponseSchema } from '@travel-app/shared/contracts/ai';
import type { TripPlanRequest, TripPlanResponse } from './types';
import { apiClient, parseApiData } from './client';

export async function planTrip(query: string, location?: string): Promise<TripPlanResponse> {
  const payload: TripPlanRequest = tripPlanRequestSchema.parse({ query, location });
  const res = await apiClient.post('/ai/trip-plan', payload);
  return parseApiData(res.data, tripPlanResponseSchema);
}
