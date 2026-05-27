# Product Hardening Plan

Updated: 2026-05-27

## Objective

Đưa Travel App từ trạng thái MVP sang nền product sẵn sàng deploy, ưu tiên:

- xác minh email bắt buộc
- quên mật khẩu/đổi mật khẩu/xóa tài khoản hoạt động thật
- phân quyền traveler/owner chặt
- UI auth/account gọn, cân đối, không dùng ảnh ngoài
- tài liệu deploy rõ để lên Azure VPS qua Coolify

## Completed in this wave

- backend auth/account flow đã có:
  - đăng ký chờ xác minh
  - verify email
  - resend OTP xác minh
  - login chặn email chưa xác minh
  - xóa tài khoản vĩnh viễn
- mobile đã có:
  - màn xác minh email
  - màn xóa tài khoản
  - flow đăng ký 2 bước
  - thông báo tiếng Việt có dấu theo từng trường hợp
- OpenAPI, shared contracts, docs đã cập nhật theo flow mới

## Remaining execution waves

### Wave F

- thêm DB-backed integration tests với PostgreSQL thật
- chuẩn bị test env riêng cho Prisma migrate + seed tối thiểu

### Wave G

- thêm mobile automated tests bằng `jest-expo`
- cover login/register/verify/forgot-password/edit-profile/change-password/delete-account

### Wave H

- thêm Maestro Android E2E
- chạy smoke test trên VPS/domain thật

## Release gate

- `npm run verify:api`
- `npm run verify:mobile`
- `npm run verify:storage`
- `npm --prefix apps/api run openapi:write`
- deploy thật lên Coolify + Azure PostgreSQL
- kiểm tra SMTP/Gemini/upload volume bằng dữ liệu thật
