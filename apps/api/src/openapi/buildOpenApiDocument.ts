import {
  apiErrorSchema,
  paginationMetaSchema,
} from "@travel-app/shared/common";
import {
  apiUserSchema,
  authResponseSchema,
  forgotPasswordRequestSchema,
  forgotPasswordVerifyRequestSchema,
  forgotPasswordVerifyResponseSchema,
  forgotPasswordResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  registerPendingResponseSchema,
  resendVerificationRequestSchema,
  resendVerificationResponseSchema,
  resetPasswordRequestSchema,
  resetPasswordResponseSchema,
  verifyEmailRequestSchema,
  verifyEmailResponseSchema,
} from "@travel-app/shared/contracts/auth";
import {
  tripPlanRequestSchema,
  tripPlanResponseSchema,
} from "@travel-app/shared/contracts/ai";
import {
  ownerPlaceCreateRequestSchema,
  ownerPlaceDetailSchema,
  ownerPlaceSchema,
  ownerPlaceUpdateRequestSchema,
  ownerPromotionCreateRequestSchema,
  ownerPromotionUpdateRequestSchema,
  promotionItemSchema,
  promotionScheduleSchema,
} from "@travel-app/shared/contracts/owner";
import {
  placeDetailSchema,
  placeListItemSchema,
  placeReviewSchema,
} from "@travel-app/shared/contracts/places";
import {
  reviewCreateRequestSchema,
  reviewLikeToggleSchema,
  reviewListItemSchema,
  reviewMutationResultSchema,
  reviewUpdateRequestSchema,
  userReviewListItemSchema,
} from "@travel-app/shared/contracts/reviews";
import { uploadResponseSchema } from "@travel-app/shared/contracts/uploads";
import {
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  deleteAccountRequestSchema,
  deleteAccountResponseSchema,
  updateMeRequestSchema,
} from "@travel-app/shared/contracts/users";
import type { ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type SchemaObject = Record<string, unknown>;

function toComponentSchema(name: string, schema: ZodTypeAny): SchemaObject {
  const jsonSchema = zodToJsonSchema(schema, {
    name,
    target: "openApi3",
  }) as { definitions?: Record<string, SchemaObject> } & SchemaObject;

  return jsonSchema.definitions?.[name] ?? jsonSchema;
}

function ref(name: string) {
  return { $ref: `#/components/schemas/${name}` };
}

function jsonContent(schema: SchemaObject) {
  return {
    "application/json": {
      schema,
    },
  };
}

function successSchema(schema: SchemaObject, withMeta = false): SchemaObject {
  const properties: Record<string, unknown> = {
    ok: { type: "boolean", enum: [true] },
    data: schema,
  };

  if (withMeta) {
    properties.meta = ref("PaginationMeta");
  }

  return {
    type: "object",
    required: withMeta ? ["ok", "data", "meta"] : ["ok", "data"],
    properties,
  };
}

function emptySuccessSchema(): SchemaObject {
  return {
    type: "object",
    required: ["ok"],
    properties: {
      ok: { type: "boolean", enum: [true] },
    },
  };
}

function errorResponse(description: string) {
  return {
    description,
    content: jsonContent(ref("ApiError")),
  };
}

const pathParameters = {
  placeId: {
    name: "placeId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
  reviewId: {
    name: "reviewId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
  promotionId: {
    name: "promotionId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
};

const paginationParameters = [
  {
    name: "limit",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
  },
  {
    name: "offset",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 0, default: 0 },
  },
];

export function buildOpenApiDocument(): Record<string, unknown> {
  const components = {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiError: toComponentSchema("ApiError", apiErrorSchema),
      PaginationMeta: toComponentSchema("PaginationMeta", paginationMetaSchema),
      RegisterRequest: toComponentSchema("RegisterRequest", registerRequestSchema),
      RegisterPendingResponse: toComponentSchema(
        "RegisterPendingResponse",
        registerPendingResponseSchema
      ),
      LoginRequest: toComponentSchema("LoginRequest", loginRequestSchema),
      VerifyEmailRequest: toComponentSchema(
        "VerifyEmailRequest",
        verifyEmailRequestSchema
      ),
      VerifyEmailResponse: toComponentSchema(
        "VerifyEmailResponse",
        verifyEmailResponseSchema
      ),
      ResendVerificationRequest: toComponentSchema(
        "ResendVerificationRequest",
        resendVerificationRequestSchema
      ),
      ResendVerificationResponse: toComponentSchema(
        "ResendVerificationResponse",
        resendVerificationResponseSchema
      ),
      ForgotPasswordRequest: toComponentSchema(
        "ForgotPasswordRequest",
        forgotPasswordRequestSchema
      ),
      ApiUser: toComponentSchema("ApiUser", apiUserSchema),
      AuthResponse: toComponentSchema("AuthResponse", authResponseSchema),
      ForgotPasswordResponse: toComponentSchema(
        "ForgotPasswordResponse",
        forgotPasswordResponseSchema
      ),
      ForgotPasswordVerifyRequest: toComponentSchema(
        "ForgotPasswordVerifyRequest",
        forgotPasswordVerifyRequestSchema
      ),
      ForgotPasswordVerifyResponse: toComponentSchema(
        "ForgotPasswordVerifyResponse",
        forgotPasswordVerifyResponseSchema
      ),
      ResetPasswordRequest: toComponentSchema(
        "ResetPasswordRequest",
        resetPasswordRequestSchema
      ),
      ResetPasswordResponse: toComponentSchema(
        "ResetPasswordResponse",
        resetPasswordResponseSchema
      ),
      UpdateMeRequest: toComponentSchema("UpdateMeRequest", updateMeRequestSchema),
      ChangePasswordRequest: toComponentSchema(
        "ChangePasswordRequest",
        changePasswordRequestSchema
      ),
      ChangePasswordResponse: toComponentSchema(
        "ChangePasswordResponse",
        changePasswordResponseSchema
      ),
      DeleteAccountRequest: toComponentSchema(
        "DeleteAccountRequest",
        deleteAccountRequestSchema
      ),
      DeleteAccountResponse: toComponentSchema(
        "DeleteAccountResponse",
        deleteAccountResponseSchema
      ),
      PlaceListItem: toComponentSchema("PlaceListItem", placeListItemSchema),
      PlaceReview: toComponentSchema("PlaceReview", placeReviewSchema),
      PlaceDetail: toComponentSchema("PlaceDetail", placeDetailSchema),
      ReviewCreateRequest: toComponentSchema(
        "ReviewCreateRequest",
        reviewCreateRequestSchema
      ),
      ReviewUpdateRequest: toComponentSchema(
        "ReviewUpdateRequest",
        reviewUpdateRequestSchema
      ),
      ReviewListItem: toComponentSchema("ReviewListItem", reviewListItemSchema),
      UserReviewListItem: toComponentSchema(
        "UserReviewListItem",
        userReviewListItemSchema
      ),
      ReviewLikeToggleResponse: toComponentSchema(
        "ReviewLikeToggleResponse",
        reviewLikeToggleSchema
      ),
      ReviewMutationResult: toComponentSchema(
        "ReviewMutationResult",
        reviewMutationResultSchema
      ),
      UploadResponse: toComponentSchema("UploadResponse", uploadResponseSchema),
      OwnerPlace: toComponentSchema("OwnerPlace", ownerPlaceSchema),
      OwnerPlaceDetail: toComponentSchema("OwnerPlaceDetail", ownerPlaceDetailSchema),
      PromotionSchedule: toComponentSchema(
        "PromotionSchedule",
        promotionScheduleSchema
      ),
      PromotionItem: toComponentSchema("PromotionItem", promotionItemSchema),
      OwnerPlaceCreateRequest: toComponentSchema(
        "OwnerPlaceCreateRequest",
        ownerPlaceCreateRequestSchema
      ),
      OwnerPlaceUpdateRequest: toComponentSchema(
        "OwnerPlaceUpdateRequest",
        ownerPlaceUpdateRequestSchema
      ),
      OwnerPromotionCreateRequest: toComponentSchema(
        "OwnerPromotionCreateRequest",
        ownerPromotionCreateRequestSchema
      ),
      OwnerPromotionUpdateRequest: toComponentSchema(
        "OwnerPromotionUpdateRequest",
        ownerPromotionUpdateRequestSchema
      ),
      TripPlanRequest: toComponentSchema("TripPlanRequest", tripPlanRequestSchema),
      TripPlanResponse: toComponentSchema("TripPlanResponse", tripPlanResponseSchema),
      HealthStatus: {
        type: "object",
        required: ["ok", "storage"],
        properties: {
          ok: { type: "boolean" },
          storage: {
            type: "object",
            required: [
              "driver",
              "publicBaseUrl",
              "publicBaseUrlConfigured",
              "uploadsDir",
              "writable",
            ],
            properties: {
              driver: { type: "string", enum: ["local"] },
              publicBaseUrl: { type: "string" },
              publicBaseUrlConfigured: { type: "boolean" },
              uploadsDir: { type: "string" },
              writable: { type: "boolean" },
            },
          },
        },
      },
      UploadForm: {
        type: "object",
        required: ["file"],
        properties: {
          file: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  };

  return {
    openapi: "3.0.3",
    info: {
      title: "Travel App API",
      version: "1.0.0",
      description:
        "Generated from backend route definitions and shared Zod contracts.",
    },
    servers: [
      {
        url: "/",
      },
    ],
    components,
    tags: [
      { name: "System" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Places" },
      { name: "Reviews" },
      { name: "Favorites" },
      { name: "Uploads" },
      { name: "Owner" },
      { name: "AI" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Writable storage available",
              content: jsonContent(ref("HealthStatus")),
            },
            "503": {
              description: "Storage unavailable",
              content: jsonContent(ref("HealthStatus")),
            },
          },
        },
      },
      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user and send email verification OTP",
          requestBody: {
            required: true,
            content: jsonContent(ref("RegisterRequest")),
          },
          responses: {
            "201": {
              description: "Registered and waiting for email verification",
              content: jsonContent(successSchema(ref("RegisterPendingResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "409": errorResponse("Email already in use"),
            "503": errorResponse("Email delivery unavailable"),
          },
        },
      },
      "/api/v1/auth/register/verify": {
        post: {
          tags: ["Auth"],
          summary: "Verify email with OTP and activate account",
          requestBody: {
            required: true,
            content: jsonContent(ref("VerifyEmailRequest")),
          },
          responses: {
            "200": {
              description: "Email verified and authenticated",
              content: jsonContent(successSchema(ref("VerifyEmailResponse"))),
            },
            "400": errorResponse("Invalid or expired OTP"),
            "404": errorResponse("Account not found"),
            "409": errorResponse("Email already verified"),
          },
        },
      },
      "/api/v1/auth/register/resend-otp": {
        post: {
          tags: ["Auth"],
          summary: "Resend email verification OTP",
          requestBody: {
            required: true,
            content: jsonContent(ref("ResendVerificationRequest")),
          },
          responses: {
            "200": {
              description: "Verification OTP sent again",
              content: jsonContent(successSchema(ref("ResendVerificationResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "404": errorResponse("Account not found"),
            "409": errorResponse("Email already verified"),
            "429": errorResponse("Rate limited"),
            "503": errorResponse("Email delivery unavailable"),
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: jsonContent(ref("LoginRequest")),
          },
          responses: {
            "200": {
              description: "Authenticated",
              content: jsonContent(successSchema(ref("AuthResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Invalid credentials"),
            "403": errorResponse("Email not verified"),
          },
        },
      },
      "/api/v1/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request a password reset",
          requestBody: {
            required: true,
            content: jsonContent(ref("ForgotPasswordRequest")),
          },
          responses: {
            "200": {
              description: "Reset flow accepted",
              content: jsonContent(successSchema(ref("ForgotPasswordResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "404": errorResponse("Account not found"),
            "429": errorResponse("Rate limited"),
            "503": errorResponse("Email delivery unavailable"),
          },
        },
      },
      "/api/v1/auth/forgot-password/verify": {
        post: {
          tags: ["Auth"],
          summary: "Verify a password reset OTP",
          requestBody: {
            required: true,
            content: jsonContent(ref("ForgotPasswordVerifyRequest")),
          },
          responses: {
            "200": {
              description: "OTP verified",
              content: jsonContent(successSchema(ref("ForgotPasswordVerifyResponse"))),
            },
            "400": errorResponse("Invalid or expired OTP"),
          },
        },
      },
      "/api/v1/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset a password with verified OTP",
          requestBody: {
            required: true,
            content: jsonContent(ref("ResetPasswordRequest")),
          },
          responses: {
            "200": {
              description: "Password reset completed",
              content: jsonContent(successSchema(ref("ResetPasswordResponse"))),
            },
            "400": errorResponse("Invalid request or OTP"),
            "404": errorResponse("Account not found"),
          },
        },
      },
      "/api/v1/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Profile",
              content: jsonContent(successSchema(ref("ApiUser"))),
            },
            "401": errorResponse("Unauthorized"),
            "404": errorResponse("User not found"),
          },
        },
        patch: {
          tags: ["Users"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: jsonContent(ref("UpdateMeRequest")),
          },
          responses: {
            "200": {
              description: "Updated profile",
              content: jsonContent(successSchema(ref("ApiUser"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "409": errorResponse("Username already taken"),
          },
        },
      },
      "/api/v1/users/me/change-password": {
        post: {
          tags: ["Users"],
          summary: "Change current user password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: jsonContent(ref("ChangePasswordRequest")),
          },
          responses: {
            "200": {
              description: "Password changed",
              content: jsonContent(successSchema(ref("ChangePasswordResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Invalid current password"),
            "404": errorResponse("User not found"),
          },
        },
      },
      "/api/v1/users/me/delete": {
        post: {
          tags: ["Users"],
          summary: "Delete current user account permanently",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: jsonContent(ref("DeleteAccountRequest")),
          },
          responses: {
            "200": {
              description: "Account deleted",
              content: jsonContent(successSchema(ref("DeleteAccountResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Invalid current password"),
            "404": errorResponse("User not found"),
          },
        },
      },
      "/api/v1/users/me/reviews": {
        get: {
          tags: ["Users", "Reviews"],
          summary: "List reviews created by current user",
          security: [{ bearerAuth: [] }],
          parameters: paginationParameters,
          responses: {
            "200": {
              description: "Review list",
              content: jsonContent(
                successSchema({ type: "array", items: ref("UserReviewListItem") }, true)
              ),
            },
            "401": errorResponse("Unauthorized"),
          },
        },
      },
      "/api/v1/users/me/favorites": {
        get: {
          tags: ["Users", "Favorites"],
          summary: "List current user favorites",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Favorite places",
              content: jsonContent(
                successSchema({ type: "array", items: ref("PlaceListItem") })
              ),
            },
            "401": errorResponse("Unauthorized"),
          },
        },
      },
      "/api/v1/users/me/favorites/places/{placeId}": {
        post: {
          tags: ["Users", "Favorites"],
          summary: "Add a place to favorites",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          responses: {
            "201": {
              description: "Added",
              content: jsonContent(emptySuccessSchema()),
            },
            "401": errorResponse("Unauthorized"),
            "404": errorResponse("Place not found"),
          },
        },
        delete: {
          tags: ["Users", "Favorites"],
          summary: "Remove a place from favorites",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          responses: {
            "200": {
              description: "Removed",
              content: jsonContent(emptySuccessSchema()),
            },
            "401": errorResponse("Unauthorized"),
          },
        },
      },
      "/api/v1/places": {
        get: {
          tags: ["Places"],
          summary: "List places",
          parameters: [
            {
              name: "category",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["attractions", "dining", "festivals"] },
            },
            ...paginationParameters,
          ],
          responses: {
            "200": {
              description: "Places",
              content: jsonContent(
                successSchema({ type: "array", items: ref("PlaceListItem") }, true)
              ),
            },
          },
        },
      },
      "/api/v1/places/{placeId}": {
        get: {
          tags: ["Places"],
          summary: "Get place detail",
          parameters: [pathParameters.placeId],
          responses: {
            "200": {
              description: "Place detail",
              content: jsonContent(successSchema(ref("PlaceDetail"))),
            },
            "404": errorResponse("Place not found"),
          },
        },
      },
      "/api/v1/places/{placeId}/reviews": {
        get: {
          tags: ["Places", "Reviews"],
          summary: "List reviews for a place",
          parameters: [pathParameters.placeId, ...paginationParameters],
          responses: {
            "200": {
              description: "Reviews",
              content: jsonContent(
                successSchema({ type: "array", items: ref("ReviewListItem") }, true)
              ),
            },
            "404": errorResponse("Place not found"),
          },
        },
        post: {
          tags: ["Places", "Reviews"],
          summary: "Create a review for a place",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          requestBody: {
            required: true,
            content: jsonContent(ref("ReviewCreateRequest")),
          },
          responses: {
            "201": {
              description: "Review created",
              content: jsonContent(successSchema(ref("ReviewMutationResult"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "404": errorResponse("Place not found"),
          },
        },
      },
      "/api/v1/reviews/{reviewId}": {
        patch: {
          tags: ["Reviews"],
          summary: "Update a review",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.reviewId],
          requestBody: {
            required: true,
            content: jsonContent(ref("ReviewUpdateRequest")),
          },
          responses: {
            "200": {
              description: "Review updated",
              content: jsonContent(successSchema(ref("ReviewMutationResult"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Review not found"),
          },
        },
        delete: {
          tags: ["Reviews"],
          summary: "Delete a review",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.reviewId],
          responses: {
            "200": {
              description: "Review deleted",
              content: jsonContent(emptySuccessSchema()),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Review not found"),
          },
        },
      },
      "/api/v1/reviews/{reviewId}/likes/toggle": {
        post: {
          tags: ["Reviews"],
          summary: "Toggle like for a review",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.reviewId],
          responses: {
            "200": {
              description: "Like toggled",
              content: jsonContent(successSchema(ref("ReviewLikeToggleResponse"))),
            },
            "401": errorResponse("Unauthorized"),
            "404": errorResponse("Review not found"),
          },
        },
      },
      "/api/v1/uploads/review-image": {
        post: {
          tags: ["Uploads"],
          summary: "Upload a review image",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: ref("UploadForm"),
              },
            },
          },
          responses: {
            "201": {
              description: "Uploaded",
              content: jsonContent(successSchema(ref("UploadResponse"))),
            },
            "400": errorResponse("Missing file or invalid form"),
            "401": errorResponse("Unauthorized"),
            "413": errorResponse("File too large"),
            "415": errorResponse("Unsupported media type"),
            "503": errorResponse("Storage unavailable"),
          },
        },
      },
      "/api/v1/uploads/avatar": {
        post: {
          tags: ["Uploads", "Users"],
          summary: "Upload a user avatar",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: ref("UploadForm"),
              },
            },
          },
          responses: {
            "201": {
              description: "Uploaded",
              content: jsonContent(successSchema(ref("UploadResponse"))),
            },
            "400": errorResponse("Missing file or invalid form"),
            "401": errorResponse("Unauthorized"),
            "413": errorResponse("File too large"),
            "415": errorResponse("Unsupported media type"),
            "503": errorResponse("Storage unavailable"),
          },
        },
      },
      "/api/v1/uploads/place-cover": {
        post: {
          tags: ["Uploads", "Owner"],
          summary: "Upload a place cover image",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: ref("UploadForm"),
              },
            },
          },
          responses: {
            "201": {
              description: "Uploaded",
              content: jsonContent(successSchema(ref("UploadResponse"))),
            },
            "400": errorResponse("Missing file or invalid form"),
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "413": errorResponse("File too large"),
            "415": errorResponse("Unsupported media type"),
            "503": errorResponse("Storage unavailable"),
          },
        },
      },
      "/api/v1/owner/places": {
        get: {
          tags: ["Owner"],
          summary: "List owner places",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Owner places",
              content: jsonContent(
                successSchema({ type: "array", items: ref("OwnerPlace") })
              ),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
          },
        },
        post: {
          tags: ["Owner"],
          summary: "Create a place as owner",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: jsonContent(ref("OwnerPlaceCreateRequest")),
          },
          responses: {
            "201": {
              description: "Owner place created",
              content: jsonContent(successSchema(ref("OwnerPlace"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
          },
        },
      },
      "/api/v1/owner/places/{placeId}": {
        get: {
          tags: ["Owner"],
          summary: "Get owner place detail",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          responses: {
            "200": {
              description: "Owner place detail",
              content: jsonContent(successSchema(ref("OwnerPlaceDetail"))),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Place not found"),
          },
        },
        patch: {
          tags: ["Owner"],
          summary: "Update an owner place",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          requestBody: {
            required: true,
            content: jsonContent(ref("OwnerPlaceUpdateRequest")),
          },
          responses: {
            "200": {
              description: "Owner place updated",
              content: jsonContent(successSchema(ref("OwnerPlace"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Place not found"),
          },
        },
        delete: {
          tags: ["Owner"],
          summary: "Delete an owner place",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          responses: {
            "200": {
              description: "Owner place deleted",
              content: jsonContent(emptySuccessSchema()),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Place not found"),
          },
        },
      },
      "/api/v1/owner/places/{placeId}/promotions": {
        get: {
          tags: ["Owner"],
          summary: "List promotions for an owner place",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          responses: {
            "200": {
              description: "Promotions",
              content: jsonContent(
                successSchema({ type: "array", items: ref("PromotionItem") })
              ),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Place not found"),
          },
        },
        post: {
          tags: ["Owner"],
          summary: "Create a promotion for an owner place",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.placeId],
          requestBody: {
            required: true,
            content: jsonContent(ref("OwnerPromotionCreateRequest")),
          },
          responses: {
            "201": {
              description: "Promotion created",
              content: jsonContent(successSchema(ref("PromotionItem"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Place not found"),
          },
        },
      },
      "/api/v1/owner/promotions/{promotionId}": {
        patch: {
          tags: ["Owner"],
          summary: "Update a promotion",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.promotionId],
          requestBody: {
            required: true,
            content: jsonContent(ref("OwnerPromotionUpdateRequest")),
          },
          responses: {
            "200": {
              description: "Promotion updated",
              content: jsonContent(successSchema(ref("PromotionItem"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Promotion not found"),
          },
        },
        delete: {
          tags: ["Owner"],
          summary: "Delete a promotion",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.promotionId],
          responses: {
            "200": {
              description: "Promotion deleted",
              content: jsonContent(emptySuccessSchema()),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Promotion not found"),
          },
        },
      },
      "/api/v1/owner/promotions/{promotionId}/toggle": {
        post: {
          tags: ["Owner"],
          summary: "Toggle a promotion active state",
          security: [{ bearerAuth: [] }],
          parameters: [pathParameters.promotionId],
          responses: {
            "200": {
              description: "Promotion toggled",
              content: jsonContent(successSchema(ref("PromotionItem"))),
            },
            "401": errorResponse("Unauthorized"),
            "403": errorResponse("Forbidden"),
            "404": errorResponse("Promotion not found"),
          },
        },
      },
      "/api/v1/ai/trip-plan": {
        post: {
          tags: ["AI"],
          summary: "Generate a trip plan",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: jsonContent(ref("TripPlanRequest")),
          },
          responses: {
            "200": {
              description: "Trip plan",
              content: jsonContent(successSchema(ref("TripPlanResponse"))),
            },
            "400": errorResponse("Validation failed"),
            "401": errorResponse("Unauthorized"),
          },
        },
      },
    },
  };
}
