# Tóm tắt codebase Travel App

Cập nhật: 2026-05-28

## Cấu trúc monorepo

- `apps/api`: backend Express + TypeScript + Prisma
- `apps/mobile`: ứng dụng Expo / React Native
- `packages/shared`: shared contracts bằng Zod, response envelope, error code

## Mức độ hoàn thiện hiện tại

- Backend nghiệp vụ cốt lõi: `85%`
- Mobile luồng chính: `80%`
- Phân quyền và xử lý lỗi người dùng: `80%`
- QA tự động: `65%`
- Đường deploy Azure VPS + Coolify: `80%`
- APK nội bộ: `85%`
- Play Store readiness: `60%`

## Tính năng backend đã có

### `auth`

- đăng ký tài khoản `traveler` hoặc `owner`
- gửi OTP xác minh email
- xác minh email và cấp JWT
- gửi lại OTP xác minh
- đăng nhập email / mật khẩu
- quên mật khẩu bằng OTP email
- đặt lại mật khẩu

### `users`

- xem hồ sơ hiện tại
- cập nhật hồ sơ
- đổi mật khẩu
- xóa tài khoản vĩnh viễn
- xem review của chính mình
- xem danh sách địa điểm đã lưu

### `places`

- danh sách địa điểm công khai
- lọc theo danh mục chuẩn
- xem chi tiết địa điểm
- xem danh sách review theo địa điểm

### `reviews`

- tạo review
- sửa / xóa review của chính mình
- thích / bỏ thích review

### `favorites`

- thêm / xóa địa điểm yêu thích
- lấy danh sách địa điểm đã lưu

### `owner`

- xem danh sách địa điểm của owner
- tạo / sửa / xóa địa điểm của owner
- tạo / sửa / bật tắt / xóa ưu đãi của owner

### `uploads`

- upload ảnh review
- upload ảnh bìa địa điểm
- upload ảnh đại diện

### `ai`

- gợi ý kế hoạch du lịch bằng Gemini

### `health`

- kiểm tra kết nối PostgreSQL
- kiểm tra quyền ghi thư mục upload

## Tính năng mobile đã có

### Người dùng chưa đăng nhập

- đăng nhập
- đăng ký
- chọn loại tài khoản `traveler` hoặc `owner`
- xem điều khoản sử dụng
- xác minh email
- quên mật khẩu

### Traveler

- duyệt địa điểm
- xem chi tiết địa điểm
- lưu / bỏ lưu địa điểm
- viết review
- xem review của chính mình
- chỉnh sửa hồ sơ
- đổi mật khẩu
- xóa tài khoản
- đăng xuất
- nhận gợi ý hành trình bằng AI

### Owner

- có toàn bộ quyền của traveler
- thêm địa điểm
- sửa / xóa địa điểm của mình
- tạo / sửa / tắt / xóa ưu đãi

## Phân quyền hiện tại

### `anonymous`

- chỉ được xem danh sách địa điểm, chi tiết địa điểm, review công khai
- không được mutation

### `traveler`

- thao tác trên dữ liệu của chính mình:
  - hồ sơ
  - review
  - favorites
  - đổi mật khẩu
  - xóa tài khoản
  - AI trip planning

### `owner`

- có toàn bộ quyền của traveler
- chỉ được thao tác trên địa điểm và ưu đãi do chính mình sở hữu
- không được sửa / xóa dữ liệu owner khác

## Quy ước dữ liệu công khai

- role công khai: `traveler | owner`
- category công khai: `attractions | dining | festivals`
- response API: `ApiResponse`
- mọi lỗi nghiệp vụ đi qua error code dùng chung

## Kiểm thử hiện có

### Backend local-safe

- `npm run verify:api`
- `56` test pass
- phủ các nhóm:
  - auth
  - users
  - places
  - reviews
  - favorites
  - owner
  - uploads
  - ai
  - health
  - pagination

### Backend DB-backed

- đã có suite `tests/db`
- chạy bằng `npm run verify:api:db`
- cần PostgreSQL thật qua:
  - Azure PostgreSQL
  - PostgreSQL local
  - service PostgreSQL trong GitHub Actions

### Mobile

- `npm run verify:mobile`
- `npm run test:mobile`
- hiện có `11` test cho các màn và luồng chính:
  - login
  - register
  - verify email
  - delete account
  - saved places
  - owner management

### Android E2E

- đã thêm baseline flow Maestro trong `apps/mobile/.maestro`

## CI/CD và deploy

- nhánh phát triển chính: `main`
- GitHub Actions:
  - `CI`: chạy verify backend, verify mobile, storage check, DB-backed backend tests, mobile tests
  - `Promote Deploy`: đồng bộ `main -> deploy` khi CI pass
- Coolify:
  - theo dõi nhánh `deploy`
  - build từ repo root
  - dùng `apps/api/Dockerfile`
- database production: `Azure Database for PostgreSQL`

## Khoảng trống còn lại trước khi xem là product hoàn chỉnh

- chưa xác nhận live deploy thật trên Azure VPS + Coolify + Azure PostgreSQL + SMTP + Gemini
- chưa build thử APK/AAB trên môi trường EAS thật trong lượt này
- chưa đổi `android.package` sang danh tính phát hành cuối cùng cho Google Play
- vẫn cần manual test trên thiết bị thật để bắt lỗi layout hoặc hành vi ngữ cảnh máy thật
