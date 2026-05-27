# Travel App Codebase Summary

Updated: 2026-05-27

## Repository shape

- `apps/api`: Express + TypeScript + Prisma backend
- `apps/mobile`: Expo / React Native mobile client
- `packages/shared`: shared Zod-first contracts, response envelopes, error codes

## Feature inventory

### Backend modules

- `auth`
  - đăng ký tài khoản
  - gửi OTP xác minh email
  - xác minh email và kích hoạt tài khoản
  - gửi lại OTP xác minh
  - đăng nhập bằng email/mật khẩu
  - quên mật khẩu qua OTP email
- `users`
  - xem/cập nhật hồ sơ
  - đổi mật khẩu
  - xóa tài khoản vĩnh viễn
  - xem đánh giá của chính mình
  - xem địa điểm đã lưu
- `places`
  - danh sách địa điểm công khai
  - chi tiết địa điểm
  - danh sách đánh giá theo địa điểm
- `reviews`
  - tạo, sửa, xóa đánh giá của chính mình
  - thích/bỏ thích đánh giá
- `owner`
  - CRUD địa điểm thuộc owner
  - CRUD/toggle ưu đãi thuộc owner
- `uploads`
  - upload ảnh review
  - upload ảnh bìa địa điểm
  - upload ảnh đại diện
- `ai`
  - gợi ý kế hoạch du lịch qua Gemini
- `health`
  - kiểm tra PostgreSQL + storage local

### Mobile flows

- khách chưa đăng nhập
  - đăng nhập
  - đăng ký
  - chọn loại tài khoản traveler hoặc owner khi đăng ký
  - xem điều khoản sử dụng
  - xác minh email
  - quên mật khẩu
- traveler
  - duyệt địa điểm
  - xem chi tiết
  - lưu/bỏ lưu địa điểm
  - viết đánh giá
  - xem đánh giá của mình
  - chỉnh sửa hồ sơ
  - đổi mật khẩu
  - xóa tài khoản
  - đăng xuất
  - lập kế hoạch bằng AI
- owner
  - toàn bộ quyền traveler
  - thêm địa điểm
  - sửa/xóa địa điểm của mình
  - tạo/sửa/tắt/xóa ưu đãi

## Current role model

- database roles: `TRAVELER`, `OWNER`
- public/shared API roles: `traveler`, `owner`
- không có `admin` trong phạm vi sản phẩm hiện tại

## Canonical public categories

- `attractions`
- `dining`
- `festivals`

## Cross-feature impact

- `auth` là nền cho toàn bộ mutation của traveler và owner
- `email verification` chặn đăng nhập cho tài khoản chưa kích hoạt
- `users` cấp dữ liệu cho profile, avatar, saved places, reviews, delete account
- `places` là đầu vào cho favorites, reviews, owner detail, AI gợi ý
- `reviews` tác động trực tiếp tới rating aggregate của place
- `owner` phụ thuộc `uploads`, category chuẩn hóa và ownership guard
- `uploads` phụ thuộc volume ghi được và `PUBLIC_BASE_URL`
- `ai` phụ thuộc JWT, rate limit và Gemini credentials

## Product readiness snapshot

- backend build/test: xanh, `56` test pass
- mobile typecheck/lint: xanh
- OpenAPI: sinh từ code + shared contracts
- Azure VPS + Coolify path: đã có tài liệu
- auth/account core: đã có xác minh email, quên mật khẩu OTP, đổi mật khẩu, đăng xuất, xóa tài khoản
- remote runtime fallback: đã bỏ khỏi các flow auth/account chính và avatar review/profile

## Remaining product gaps

- chưa có DB-backed integration test với PostgreSQL thật
- chưa có mobile automated tests bằng `jest-expo`
- chưa có Android E2E flow bằng Maestro
- chưa xác nhận deploy thật trên Coolify/Azure với SMTP và Gemini credentials thật
