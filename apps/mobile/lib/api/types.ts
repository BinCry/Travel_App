import type { ApiErr, ApiOk } from '@travel-app/shared/common';

export type { ApiErr, ApiOk };
export type { PaginationMeta } from '@travel-app/shared/common';
export type {
  ApiUser,
  ApiUserRole,
  AuthResponse,
  ForgotPasswordResponse,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  LoginRequest,
  RegisterPendingResponse,
  RegisterRequest,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@travel-app/shared/contracts/auth';
export type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  UpdateMeRequest,
} from '@travel-app/shared/contracts/users';
export type {
  OwnerAnalyticsSummary,
  OwnerAnalyticsTopPlace,
  OwnerPlace,
  OwnerPlaceDetail,
  OwnerPlaceCreateRequest,
  OwnerPlaceUpdateRequest,
  PromotionItem,
  OwnerPromotionCreateRequest,
  OwnerPromotionUpdateRequest,
  PromotionSchedule,
} from '@travel-app/shared/contracts/owner';
export type {
  PlaceCategory,
  PlaceDetail,
  PlaceListItem,
  PlaceReview,
} from '@travel-app/shared/contracts/places';
export type {
  CollectionCreateRequest,
  CollectionDetail,
  CollectionPlaceItem,
  CollectionSummary,
  CollectionUpdateRequest,
} from '@travel-app/shared/contracts/collections';
export type {
  NotificationItem,
  NotificationType,
} from '@travel-app/shared/contracts/notifications';
export type {
  PlaceUpdate,
  PlaceUpdateCreateRequest,
  PlaceUpdateUpdateRequest,
} from '@travel-app/shared/contracts/place-updates';
export type {
  OwnerPlaceReview,
  OwnerReviewReply,
  OwnerReviewReplyUpsertRequest,
  ReviewCreateRequest,
  ReviewLikeToggleResponse,
  ReviewListItem,
  ReviewUpdateRequest,
  UserReviewListItem,
} from '@travel-app/shared/contracts/reviews';
export type {
  AvailabilitySlot,
  AvailabilitySlotCreateRequest,
  AvailabilitySlotUpdateRequest,
  BookingCreateRequest,
  BookingOption,
  BookingOptionCreateRequest,
  BookingOptionUpdateRequest,
  BookingStatus,
  OwnerBookingStatusUpdateRequest,
  OwnerPlaceBooking,
  TravelerBooking,
} from '@travel-app/shared/contracts/bookings';
export type {
  TripBudget,
  TripCreateRequest,
  TripDetail,
  TripListItem,
  TripStop,
  TripStopCreateRequest,
  TripStopUpdateRequest,
  TripUpdateRequest,
} from '@travel-app/shared/contracts/trips';
export type { TripPlanRequest, TripPlanResponse } from '@travel-app/shared/contracts/ai';
export type { UploadResponse } from '@travel-app/shared/contracts/uploads';
