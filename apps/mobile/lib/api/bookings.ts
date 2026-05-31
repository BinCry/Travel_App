import { z } from 'zod';
import {
  bookingQuoteRequestSchema,
  bookingQuoteSchema,
  bookingCreateRequestSchema,
  travelerBookingCancelRequestSchema,
  bookingOptionSchema,
  travelerBookingDetailSchema,
  travelerBookingSchema,
} from '@travel-app/shared/contracts/bookings';
import type {
  BookingCreateRequest,
  BookingOption,
  BookingQuote,
  TravelerBooking,
  TravelerBookingCancelRequest,
  TravelerBookingDetail,
} from './types';
import { apiClient, parseApiData, parseApiDataWithMeta } from './client';

export async function fetchPlaceBookingOptions(placeId: string): Promise<BookingOption[]> {
  const res = await apiClient.get(`/bookings/places/${placeId}/options`);
  return parseApiData(res.data, z.array(bookingOptionSchema));
}

export async function createBooking(body: BookingCreateRequest): Promise<TravelerBooking> {
  const res = await apiClient.post('/bookings', bookingCreateRequestSchema.parse(body));
  return parseApiData(res.data, travelerBookingSchema);
}

export async function quoteBooking(body: BookingCreateRequest): Promise<BookingQuote> {
  const res = await apiClient.post('/bookings/quote', bookingQuoteRequestSchema.parse(body));
  return parseApiData(res.data, bookingQuoteSchema);
}

export async function fetchMyBookings(): Promise<TravelerBooking[]> {
  const res = await apiClient.get('/bookings', {
    params: { limit: 50, offset: 0 },
  });
  return parseApiDataWithMeta(res.data, z.array(travelerBookingSchema)).data;
}

export async function fetchMyBookingDetail(bookingId: string): Promise<TravelerBookingDetail> {
  const res = await apiClient.get(`/bookings/${bookingId}`);
  return parseApiData(res.data, travelerBookingDetailSchema);
}

export async function cancelBooking(
  bookingId: string,
  body?: TravelerBookingCancelRequest
): Promise<TravelerBooking> {
  const res = await apiClient.post(
    `/bookings/${bookingId}/cancel`,
    travelerBookingCancelRequestSchema.parse(body ?? {})
  );
  return parseApiData(res.data, travelerBookingSchema);
}
