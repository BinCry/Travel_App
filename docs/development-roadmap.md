# Development Roadmap

Updated: 2026-05-27

## Completed in the current hardening wave

- thêm xác minh email bắt buộc trước khi đăng nhập
- thêm resend OTP xác minh
- thêm xóa tài khoản vĩnh viễn cho traveler và owner
- thêm rollback đăng ký nếu gửi email xác minh thất bại
- thêm mail template tiếng Việt có dấu cho xác minh email và đặt lại mật khẩu
- bỏ runtime fallback avatar ngoài hệ thống ở backend
- thêm màn `Xác minh email` và `Xóa tài khoản` trên mobile
- bỏ ảnh URL ngoài ở các màn auth/account chính
- cập nhật OpenAPI theo flow mới

## Still recommended before final submission

1. Chạy deploy thật lên Coolify/Azure VPS.
2. Kiểm tra SMTP thật với hộp thư thật.
3. Kiểm tra Gemini thật với credential production.
4. Viết thêm DB-backed tests với PostgreSQL thật.
5. Thêm mobile automated tests và Android E2E flow.
6. Chạy smoke test end-to-end trên domain thật và bản build Android preview.

## Optional hardening after thesis deadline

- nâng cấp coverage sâu hơn cho lỗi mạng/timeout mobile
- dọn tiếp package audit warnings không cần major framework upgrade
- thêm analytics/log aggregation cho production
