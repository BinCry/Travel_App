import { z } from 'zod';
import {
  ownerAnalyticsSummarySchema,
  ownerPlaceCreateRequestSchema,
  ownerPlaceDetailSchema,
  ownerPlaceSchema,
  ownerPlaceUpdateRequestSchema,
  ownerPromotionCreateRequestSchema,
  ownerPromotionUpdateRequestSchema,
  promotionItemSchema,
} from '@travel-app/shared/contracts/owner';
import {
  placeUpdateCreateRequestSchema,
  placeUpdateSchema,
  placeUpdateUpdateRequestSchema,
} from '@travel-app/shared/contracts/place-updates';
import {
  availabilitySlotCreateRequestSchema,
  availabilitySlotSchema,
  availabilitySlotUpdateRequestSchema,
  bookingOptionCreateRequestSchema,
  bookingOptionSchema,
  bookingOptionUpdateRequestSchema,
  ownerBookingStatusUpdateRequestSchema,
  ownerPlaceBookingSchema,
} from '@travel-app/shared/contracts/bookings';
import {
  ownerPlaceReviewSchema,
  ownerReviewReplySchema,
  ownerReviewReplyUpsertRequestSchema,
} from '@travel-app/shared/contracts/reviews';
import type {
  AvailabilitySlot,
  BookingOption,
  BookingOptionCreateRequest,
  BookingOptionUpdateRequest,
  OwnerAnalyticsSummary,
  OwnerPlace,
  OwnerPlaceBooking,
  OwnerBookingStatusUpdateRequest,
  OwnerPlaceCreateRequest,
  OwnerPlaceDetail,
  OwnerPlaceReview,
  OwnerPlaceUpdateRequest,
  OwnerPromotionCreateRequest,
  OwnerPromotionUpdateRequest,
  OwnerReviewReply,
  OwnerReviewReplyUpsertRequest,
  PlaceUpdate,
  PlaceUpdateCreateRequest,
  PlaceUpdateUpdateRequest,
  PromotionItem,
} from './types';
import { apiClient, parseApiData, parseApiDataWithMeta } from './client';

export type { OwnerPlace, OwnerPlaceDetail, PromotionItem } from './types';

export async function fetchOwnerPlaces(): Promise<OwnerPlace[]> {
  const res = await apiClient.get('/owner/places');
  return parseApiData(res.data, z.array(ownerPlaceSchema));
}

export async function fetchOwnerAnalyticsSummary(): Promise<OwnerAnalyticsSummary> {
  const res = await apiClient.get('/owner/analytics/summary');
  return parseApiData(res.data, ownerAnalyticsSummarySchema);
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

export async function fetchOwnerPlaceReviews(placeId: string): Promise<OwnerPlaceReview[]> {
  const res = await apiClient.get(`/owner/places/${placeId}/reviews`);
  return parseApiData(res.data, z.array(ownerPlaceReviewSchema));
}

export async function fetchOwnerBookingOptions(placeId: string): Promise<BookingOption[]> {
  const res = await apiClient.get(`/owner/places/${placeId}/booking-options`);
  return parseApiData(res.data, z.array(bookingOptionSchema));
}

export async function createOwnerBookingOption(
  placeId: string,
  body: BookingOptionCreateRequest
): Promise<BookingOption> {
  const res = await apiClient.post(
    `/owner/places/${placeId}/booking-options`,
    bookingOptionCreateRequestSchema.parse(body)
  );
  return parseApiData(res.data, bookingOptionSchema);
}

export async function updateOwnerBookingOption(
  optionId: string,
  body: BookingOptionUpdateRequest
): Promise<BookingOption> {
  const res = await apiClient.patch(
    `/owner/booking-options/${optionId}`,
    bookingOptionUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, bookingOptionSchema);
}

export async function deleteOwnerBookingOption(optionId: string): Promise<void> {
  await apiClient.delete(`/owner/booking-options/${optionId}`);
}

export async function createOwnerSlot(
  optionId: string,
  body: { startAt: string; endAt: string; capacity: number; isActive?: boolean }
): Promise<AvailabilitySlot> {
  const res = await apiClient.post(
    `/owner/booking-options/${optionId}/slots`,
    availabilitySlotCreateRequestSchema.parse(body)
  );
  return parseApiData(res.data, availabilitySlotSchema);
}

export async function updateOwnerSlot(
  slotId: string,
  body: { startAt?: string; endAt?: string; capacity?: number; isActive?: boolean }
): Promise<AvailabilitySlot> {
  const res = await apiClient.patch(
    `/owner/slots/${slotId}`,
    availabilitySlotUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, availabilitySlotSchema);
}

export async function deleteOwnerSlot(slotId: string): Promise<void> {
  await apiClient.delete(`/owner/slots/${slotId}`);
}

export async function fetchOwnerPlaceBookings(placeId: string): Promise<OwnerPlaceBooking[]> {
  const res = await apiClient.get(`/owner/places/${placeId}/bookings`, {
    params: { limit: 50, offset: 0 },
  });
  return parseApiDataWithMeta(res.data, z.array(ownerPlaceBookingSchema)).data;
}

export async function updateOwnerBookingStatus(
  bookingId: string,
  body: OwnerBookingStatusUpdateRequest
): Promise<OwnerPlaceBooking> {
  const res = await apiClient.patch(
    `/owner/bookings/${bookingId}/status`,
    ownerBookingStatusUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, ownerPlaceBookingSchema);
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

export async function upsertOwnerReviewReply(
  reviewId: string,
  body: OwnerReviewReplyUpsertRequest
): Promise<OwnerReviewReply> {
  const res = await apiClient.put(
    `/owner/reviews/${reviewId}/reply`,
    ownerReviewReplyUpsertRequestSchema.parse(body)
  );
  return parseApiData(res.data, ownerReviewReplySchema);
}

export async function deleteOwnerReviewReply(reviewId: string): Promise<void> {
  await apiClient.delete(`/owner/reviews/${reviewId}/reply`);
}

export async function createOwnerPlaceUpdate(
  placeId: string,
  body: PlaceUpdateCreateRequest
): Promise<PlaceUpdate> {
  const res = await apiClient.post(
    `/owner/places/${placeId}/updates`,
    placeUpdateCreateRequestSchema.parse(body)
  );
  return parseApiData(res.data, placeUpdateSchema);
}

export async function updateOwnerPlaceUpdate(
  updateId: string,
  body: PlaceUpdateUpdateRequest
): Promise<PlaceUpdate> {
  const res = await apiClient.patch(
    `/owner/place-updates/${updateId}`,
    placeUpdateUpdateRequestSchema.parse(body)
  );
  return parseApiData(res.data, placeUpdateSchema);
}

export async function deleteOwnerPlaceUpdate(updateId: string): Promise<void> {
  await apiClient.delete(`/owner/place-updates/${updateId}`);
}
