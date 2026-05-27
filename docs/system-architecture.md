# Kiến trúc hệ thống Travel App

Cập nhật: 2026-05-28

## Cấu trúc monorepo

```text
apps/
  api/
  mobile/
packages/
  shared/
```

## Luồng request backend

1. Express nhận request HTTP.
2. Middleware gắn `requestId` và log request cơ bản.
3. Middleware auth giải mã JWT nếu route yêu cầu đăng nhập.
4. Rate limit bảo vệ các nhóm route nhạy cảm:
   - `auth`
   - `uploads`
   - `ai`
5. Service validate payload bằng shared Zod schema.
6. Prisma thao tác với PostgreSQL.
7. Response helper trả về chuẩn `ApiResponse`.

## Luồng tài khoản

### Đăng ký

1. tạo user mới với `emailVerifiedAt = null`
2. tạo `EmailVerificationOtp`
3. gửi email OTP tiếng Việt qua SMTP
4. mobile chuyển sang màn `Xác minh email`

### Xác minh email

1. lấy OTP gần nhất còn hiệu lực
2. tăng `attempts` nếu nhập sai
3. cập nhật `emailVerifiedAt`
4. cấp JWT và mở khóa ứng dụng

### Quên mật khẩu

1. tạo `PasswordResetOtp`
2. gửi OTP qua email
3. verify OTP
4. đặt mật khẩu mới và consume OTP

### Xóa tài khoản

- `traveler`
  - xóa user
  - review / favorite / like cascade theo quan hệ Prisma
  - dọn OTP còn lại
- `owner`
  - xóa toàn bộ `Place` theo `ownerId`
  - `Promotion`, `Review`, `Favorite` liên quan cascade theo `Place`
  - xóa user và OTP còn lại

## Luồng dữ liệu mobile

1. Screen gọi API trong `apps/mobile/lib/api`
2. Axios gắn token từ secure storage
3. Response parse bằng shared Zod contract
4. `AuthContext` chuẩn hóa `user`, `role`, `emailVerified`
5. Navigation phân nhánh theo trạng thái đăng nhập và vai trò

## Ranh giới phân quyền

### `anonymous`

- xem danh sách địa điểm
- xem chi tiết địa điểm
- xem review công khai
- không được mutation

### `traveler`

- toàn bộ quyền của `anonymous`
- quản lý hồ sơ của mình
- lưu địa điểm
- tạo / sửa / xóa review của mình
- đổi mật khẩu
- xóa tài khoản
- dùng AI trip planning

### `owner`

- toàn bộ quyền của `traveler`
- tạo / sửa / xóa địa điểm của mình
- tạo / sửa / bật tắt / xóa ưu đãi của mình
- upload ảnh bìa địa điểm
- không được thao tác dữ liệu owner khác

## Phụ thuộc vận hành

- `Azure Database for PostgreSQL`
  - nguồn dữ liệu production
  - bắt buộc cho toàn bộ nghiệp vụ
- volume upload local
  - bắt buộc cho avatar / place cover / review image
- SMTP
  - bắt buộc cho xác minh email và quên mật khẩu
- Gemini API
  - bắt buộc cho AI trip planning
- Coolify
  - quản lý env và deploy backend trên VPS

## Chuỗi deploy

1. dev push code lên `main`
2. GitHub Actions chạy `CI`
3. nếu pass, workflow `Promote Deploy` đồng bộ commit đó sang `deploy`
4. Coolify theo dõi `deploy` và redeploy backend

## Điểm kiểm tra sức khỏe hệ thống

- `/health`
  - PostgreSQL phải kết nối được
  - thư mục upload phải ghi được
- `/openapi.json`
  - sinh từ code và shared contract
