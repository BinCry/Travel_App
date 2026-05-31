import { z } from 'zod';
import {
  myPlaceReviewSchema,
  reviewCreateRequestSchema,
  reviewLikeToggleSchema,
  reviewListItemSchema,
  reviewMutationResultSchema,
  reviewUpdateRequestSchema,
  userReviewListItemSchema,
} from '@travel-app/shared/contracts/reviews';
import type {
  MyPlaceReview,
  ReviewCreateRequest,
  ReviewLikeToggleResponse,
  ReviewListItem,
  ReviewMutationResult,
  ReviewUpdateRequest,
  UserReviewListItem,
} from './types';
import { apiClient, parseApiData } from './client';

export async function fetchPlaceReviews(placeId: string): Promise<ReviewListItem[]> {
  const res = await apiClient.get(`/places/${placeId}/reviews`, {
    params: { limit: 50 },
  });
  return parseApiData(res.data, z.array(reviewListItemSchema));
}

export async function createReview(
  placeId: string,
  body: ReviewCreateRequest
): Promise<ReviewMutationResult> {
  const res = await apiClient.post(`/places/${placeId}/reviews`, reviewCreateRequestSchema.parse(body));
  return parseApiData(res.data, reviewMutationResultSchema);
}

export async function fetchMyReviewForPlace(placeId: string): Promise<MyPlaceReview | null> {
  const res = await apiClient.get(`/places/${placeId}/reviews/me`);
  return parseApiData(res.data, myPlaceReviewSchema.nullable());
}

export async function updateReview(
  reviewId: string,
  body: ReviewUpdateRequest
): Promise<ReviewMutationResult> {
  const res = await apiClient.patch(`/reviews/${reviewId}`, reviewUpdateRequestSchema.parse(body));
  return parseApiData(res.data, reviewMutationResultSchema);
}

export async function toggleReviewLike(reviewId: string): Promise<ReviewLikeToggleResponse> {
  const res = await apiClient.post(`/reviews/${reviewId}/likes/toggle`);
  return parseApiData(res.data, reviewLikeToggleSchema);
}

export async function fetchMyReviews(): Promise<UserReviewListItem[]> {
  const res = await apiClient.get('/users/me/reviews', {
    params: { limit: 50 },
  });
  return parseApiData(res.data, z.array(userReviewListItemSchema));
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}`);
}
