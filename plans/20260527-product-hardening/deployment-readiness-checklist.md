# Deployment Readiness Checklist

Updated: 2026-05-27

- [x] Monorepo build xanh
- [x] Shared contracts build xanh
- [x] Backend tests xanh
- [x] Mobile typecheck/lint xanh
- [x] Storage verification xanh
- [x] OpenAPI sinh lại từ code
- [x] SMTP env đã được khai báo trong `.env.example`
- [x] APP_NAME env đã được khai báo trong `.env.example`
- [x] Xác minh email bắt buộc trước khi login
- [x] Xóa tài khoản traveler/owner đã có
- [ ] Chạy deploy thật trên Coolify
- [ ] Chạy migration thật trên Azure PostgreSQL
- [ ] Kiểm tra email OTP thật
- [ ] Kiểm tra AI Gemini thật
- [ ] Kiểm tra upload volume sau restart container
- [ ] Chạy smoke test app Android với `EXPO_PUBLIC_API_BASE_URL` trỏ VPS
