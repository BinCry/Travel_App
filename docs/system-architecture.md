# Kiến trúc hệ thống Travel App

Cập nhật: 2026-05-29

## Tổng quan

```text
apps/
  api/
  mobile/
packages/
  shared/
```

Kiến trúc hiện tại là monorepo TypeScript với một backend REST và một mobile app Expo dùng chung contract validation.

## Kiến trúc backend

### Lớp xử lý request

1. Express nhận HTTP request.
2. Middleware gắn `requestId`, log request và parse JSON body.
3. `requireAuth` giải mã JWT cho route cần đăng nhập.
4. `requireOwner` chặn các route chỉ dành cho owner.
5. Service layer validate dữ liệu bằng shared Zod contracts.
6. Prisma thao tác với PostgreSQL.
7. Response helper trả về chuẩn `ApiResponse`.

### Nhóm route chính

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/places`
- `/api/v1/reviews`
- `/api/v1/favorites`
- `/api/v1/uploads`
- `/api/v1/ai`
- `/api/v1/trips`
- `/api/v1/bookings`
- `/api/v1/owner`
- `/health`
- `/openapi.json`

## Kiến trúc mobile

### Tầng ứng dụng

- Expo Router + React Navigation cho tab và stack flow.
- `AuthContext` giữ trạng thái đăng nhập, role và email verification.
- `apps/mobile/lib/api/*` là lớp gọi API bằng Axios.
- Tất cả response parse lại bằng shared contract từ `packages/shared`.

### Nhóm màn chính

- Auth: login, register, verify email, forgot/reset password.
- Explore: home, detail location, review list, saved places.
- Trip: trip list, trip planner, AI trip builder.
- Booking: booking checkout, booking history, owner manage bookings.
- Profile: profile, edit profile, password, delete account.
- Owner: owner dashboard, add location, manage place.

## Domain model chính

### User và Auth

- `User`
- `EmailVerificationOtp`
- `PasswordResetOtp`

### Traveler engagement

- `Favorite`
- `Review`
- `ReviewLike`
- `ReviewImage`
- `Trip`
- `TripStop`

### Owner growth

- `Place`
- `Promotion`
- `ReviewReply`

### Reservation

- `BookingOption`
- `AvailabilitySlot`
- `Booking`

## Luồng nghiệp vụ quan trọng

### 1. Auth flow

1. User đăng ký với role `traveler` hoặc `owner`.
2. Backend tạo OTP xác minh email.
3. User xác minh OTP để mở khóa đăng nhập đầy đủ.
4. JWT được cấp và mobile chuyển sang tab app.

### 2. Traveler trip flow

1. Traveler tạo trip thủ công hoặc vào AI Trip Builder.
2. AI trả suggestion theo `query + location`.
3. User lưu suggestion thành `Trip` và `TripStop`.
4. User có thể chỉnh lại stop, ngày, ghi chú hoặc nhân bản trip.

### 3. Booking flow

1. Owner tạo `BookingOption` và `AvailabilitySlot`.
2. Traveler xem slot bookable từ màn chi tiết địa điểm.
3. Traveler tạo booking với `slotId`, `partySize`, `note`.
4. Owner xem booking trong màn quản lý địa điểm và đổi trạng thái.
5. Traveler xem lịch sử booking hoặc hủy booking nếu còn hợp lệ.

### 4. Owner feedback flow

1. Traveler viết review cho place.
2. Owner mở review list của place mình.
3. Owner tạo hoặc cập nhật `ReviewReply`.
4. Traveler nhìn thấy phản hồi owner ở màn review.

### 5. Owner analytics flow

1. Owner dashboard gọi `/owner/analytics/summary`.
2. Backend tổng hợp place count, booking count, promotion count, review/favorite/rating và top places.
3. Mobile render summary cards và top-place cards ngay trong màn owner management.

## Ranh giới phân quyền

### Anonymous

- Chỉ được đọc dữ liệu công khai.
- Không được mutation.

### Traveler

- Chỉ được thao tác trên dữ liệu cá nhân:
  - profile
  - review của mình
  - favorite của mình
  - trip của mình
  - booking của mình

### Owner

- Có toàn bộ quyền traveler.
- Chỉ được thao tác trên place do chính mình sở hữu.
- Không được sửa place, promotion, booking, review reply của owner khác.

## Ràng buộc dữ liệu và trạng thái

### Trip

- Trip stop gắn `dayNumber` và `orderIndex`.
- Reorder stop được xử lý ở backend để tránh xung đột thứ tự.

### Booking

- Slot có `capacity` và `remainingCapacity`.
- Backend chặn overbook.
- Booking có state machine:
  - `DRAFT`
  - `PENDING`
  - `CONFIRMED`
  - `REJECTED`
  - `CANCELLED`
  - `COMPLETED`
  - `NO_SHOW`
  - `REFUND_PENDING`
  - `REFUNDED`

## Phụ thuộc vận hành

- PostgreSQL: nguồn dữ liệu chính.
- Volume upload: lưu avatar, cover image, review image.
- SMTP: gửi OTP xác minh email và reset password.
- Gemini API: sinh AI trip suggestion.
- Coolify + Azure VPS: môi trường deploy backend.

## Chuỗi release

1. Dev hoàn tất code trên `main`.
2. Chạy verify API, mobile, DB-backed tests và storage verify.
3. Commit release-ready lên `main`.
4. Nếu dùng flow production hiện tại, GitHub Actions sẽ sync `main -> deploy`.
5. Coolify redeploy backend từ nhánh `deploy`.
