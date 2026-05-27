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
  ReviewCreateRequest,
  ReviewLikeToggleResponse,
  ReviewListItem,
  ReviewUpdateRequest,
  UserReviewListItem,
} from '@travel-app/shared/contracts/reviews';
export type { TripPlanRequest, TripPlanResponse } from '@travel-app/shared/contracts/ai';
export type { UploadResponse } from '@travel-app/shared/contracts/uploads';
