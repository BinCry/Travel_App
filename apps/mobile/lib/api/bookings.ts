import { z } from 'zod';
import {
  bookingCreateRequestSchema,
  bookingOptionSchema,
  travelerBookingSchema,
} from '@travel-app/shared/contracts/bookings';
import type { BookingCreateRequest, BookingOption, TravelerBooking } from './types';
import { apiClient, parseApiData, parseApiDataWithMeta } from './client';

export async function fetchPlaceBookingOptions(placeId: string): Promise<BookingOption[]> {
  const res = await apiClient.get(`/bookings/places/${placeId}/options`);
  return parseApiData(res.data, z.array(bookingOptionSchema));
}

export async function createBooking(body: BookingCreateRequest): Promise<TravelerBooking> {
  const res = await apiClient.post('/bookings', bookingCreateRequestSchema.parse(body));
  return parseApiData(res.data, travelerBookingSchema);
}

export async function fetchMyBookings(): Promise<TravelerBooking[]> {
  const res = await apiClient.get('/bookings', {
    params: { limit: 50, offset: 0 },
  });
  return parseApiDataWithMeta(res.data, z.array(travelerBookingSchema)).data;
}

export async function cancelBooking(bookingId: string): Promise<TravelerBooking> {
  const res = await apiClient.post(`/bookings/${bookingId}/cancel`);
  return parseApiData(res.data, travelerBookingSchema);
}
