# Project Changelog

## 2026-05-27

- thêm xác minh email bắt buộc trước khi đăng nhập
- thêm endpoint `POST /api/v1/auth/register/verify`
- thêm endpoint `POST /api/v1/auth/register/resend-otp`
- thêm endpoint `POST /api/v1/users/me/delete`
- thêm Prisma model `EmailVerificationOtp` và `User.emailVerifiedAt`
- thêm template email OTP xác minh email bằng tiếng Việt có dấu
- thêm màn mobile `Xác minh email` và `Xóa tài khoản`
- thêm tự đăng ký tài khoản `traveler` hoặc `owner` ngay từ màn tạo tài khoản
- thêm màn `Điều khoản sử dụng` và nối lại luồng điều hướng từ đăng ký
- thay các màn `Home`, `Quản lý địa điểm`, `Chi tiết địa điểm`, `Đánh giá` từ fail im lặng sang trạng thái lỗi có thể tải lại
- bỏ ảnh URL ngoài ở các màn login, register, logout, profile, edit profile
- bỏ fallback avatar URL ngoài trong dữ liệu review/place runtime
- xóa `previewToken` cũ khỏi shared contract và artifact OpenAPI
- cập nhật OpenAPI, shared contracts và test suite theo flow auth/account mới

## 2026-05-26

- normalized shared public roles to `traveler | owner`
- normalized canonical categories to `attractions | dining | festivals`
- added backend rate limiting for auth, uploads, and AI
- replaced preview AI planner logic with Gemini integration
- added AI provider failure and rate-limit tests
- wired mobile `Saved Places` and `Your Reviews` screens
- completed owner place management UI with update/delete/promotion management
- removed incomplete OAuth and forgot-password UX from primary auth screens
- added Android `eas.json` profiles and Android package id
- added root `docs/` and `plans/` artifacts for architecture, deployment, and completion tracking
