# Deployment Guide

Updated: 2026-05-27

## Backend target

- host: Azure VPS
- deploy manager: Coolify
- database: Azure Database for PostgreSQL
- storage: persistent uploads volume mounted to `/app/uploads`

## Backend deploy settings

- build context: repository root
- Dockerfile: `apps/api/Dockerfile`
- container port: `3000`
- health endpoint: `/health`

## Required backend env

```env
APP_NAME=Travel App
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
PORT=3000

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash

SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=Travel App <no-reply@example.com>

PUBLIC_BASE_URL=https://your-api-domain.example.com
UPLOADS_DIR=/app/uploads
TRUST_PROXY=true
ALLOWED_ORIGINS=
```

## Mobile build env

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.example.com
```

## First deploy flow

1. Trỏ Coolify tới repository GitHub.
2. Chọn build context là repo root và Dockerfile là `apps/api/Dockerfile`.
3. Khai báo đầy đủ backend env trong Coolify.
4. Mount volume ghi được vào `/app/uploads`.
5. Deploy. Container chạy `prisma migrate deploy` trước khi start API.
6. Nếu cần dữ liệu demo, chạy `npm run db:seed` trong container sau deploy.
7. Xác minh `/health`, upload avatar, upload review image, tạo địa điểm owner, trip plan AI.

## Release smoke checklist

- đăng ký tài khoản mới
- nhận email OTP xác minh
- xác minh email thành công
- đăng nhập thành công
- quên mật khẩu và đặt lại mật khẩu thành công
- chỉnh hồ sơ + upload avatar thành công
- owner tạo/sửa/xóa địa điểm và ưu đãi thành công
- review image vẫn truy cập được sau khi restart container
- `/health` xanh

## Android build flow

1. Đặt `EXPO_PUBLIC_API_BASE_URL` là HTTPS domain public của API.
2. Chạy `npx eas build --platform android --profile preview` để lấy APK test.
3. Chạy `npx eas build --platform android --profile production` để lấy AAB release.

## References

- Backend detail: `apps/api/docs/deploy-azure-coolify.md`
- Mobile detail: `apps/mobile/README.md`
