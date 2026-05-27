# System Architecture

Updated: 2026-05-27

## Monorepo layout

```text
apps/
  api/
  mobile/
packages/
  shared/
```

## Backend request flow

1. Express route nhận request HTTP.
2. Middleware auth giải mã JWT khi route yêu cầu đăng nhập.
3. Rate limiting bảo vệ `auth`, `uploads`, `ai`.
4. Service validate payload bằng shared Zod schemas.
5. Prisma thao tác PostgreSQL.
6. Shared response helpers trả về `ApiResponse`.

## Account-security flow

### Đăng ký

1. Tạo user mới ở trạng thái `emailVerifiedAt = null`.
2. Tạo `EmailVerificationOtp`.
3. Gửi email OTP tiếng Việt có dấu qua SMTP.
4. Mobile chuyển sang màn `Xác minh email`.

### Xác minh email

1. Kiểm tra OTP gần nhất còn hiệu lực.
2. Tăng `attempts` nếu nhập sai.
3. Đánh dấu `emailVerifiedAt`.
4. Sinh JWT và cho phép vào app.

### Quên mật khẩu

1. Tạo `PasswordResetOtp`.
2. Gửi email OTP đặt lại mật khẩu.
3. Verify OTP.
4. Đặt mật khẩu mới và consume OTP.

### Xóa tài khoản

- traveler:
  - xóa user
  - các quan hệ review/favorite/like cascade theo Prisma
  - xóa OTP reset/xác minh còn lại
- owner:
  - xóa toàn bộ place do owner sở hữu
  - promotion/review/favorite liên quan cascade theo place
  - xóa user và OTP còn lại

## Mobile data flow

1. Screen gọi API client tại `apps/mobile/lib/api`.
2. Axios gắn access token từ secure storage.
3. Response parse qua shared Zod contracts.
4. `AuthContext` chuẩn hóa `user`, `role`, `emailVerified`.
5. Navigation switch giữa stack chưa đăng nhập và stack đã đăng nhập.

## Role boundaries

### Anonymous

- xem danh sách/chí tiết địa điểm
- xem đánh giá công khai
- không được favorite, review, upload, dùng AI, hay vào owner routes

### Traveler

- toàn bộ khả năng anonymous
- quản lý hồ sơ của mình
- lưu địa điểm
- tạo/xóa review của mình
- đổi mật khẩu
- xóa tài khoản
- dùng AI trip planning

### Owner

- toàn bộ khả năng traveler
- tạo/sửa/xóa địa điểm của chính mình
- tạo/sửa/toggle/xóa ưu đãi của chính mình
- upload ảnh bìa địa điểm
- không thể thao tác dữ liệu owner khác

## Operational dependencies

- PostgreSQL: bắt buộc cho toàn bộ dữ liệu nghiệp vụ và `/health`
- local uploads volume: bắt buộc cho avatar/place cover/review image
- SMTP: bắt buộc cho đăng ký xác minh email và quên mật khẩu OTP
- Gemini API: bắt buộc cho AI trip planning ở production
- Coolify env management: nguồn chân lý cho secret/runtime env trên VPS
