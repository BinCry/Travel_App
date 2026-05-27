# Hướng dẫn deploy Travel App

Cập nhật: 2026-05-28

## Mục tiêu deploy

- Backend chạy trên `Azure VPS`
- Quản lý deploy bằng `Coolify`
- Database dùng `Azure Database for PostgreSQL`
- Ảnh upload lưu trong volume local bền vững của VPS
- Mobile build APK nội bộ bằng `EAS`

## Chiến lược branch

- `main`: nhánh phát triển chính
- `deploy`: nhánh được Coolify theo dõi

Quy tắc:

1. dev push lên `main`
2. GitHub Actions chạy toàn bộ kiểm tra
3. nếu pass, workflow `Promote Deploy` force-sync `main -> deploy`
4. Coolify redeploy từ nhánh `deploy`

## GitHub Actions đã có

- `.github/workflows/ci.yml`
  - `verify:api`
  - `verify:mobile`
  - `verify:storage`
  - `verify:api:db` với PostgreSQL thật trong service CI
  - `test:mobile`
- `.github/workflows/promote-deploy.yml`
  - chỉ chạy khi `CI` pass trên `main`
  - đồng bộ commit đã pass sang `deploy`

## Backend trên Coolify

### Thiết lập service

- Build source: GitHub repo
- Branch: `deploy`
- Build context: repo root
- Dockerfile: `apps/api/Dockerfile`
- Port: `3000`
- Health endpoint: `/health`
- Volume persistent: mount vào `/app/uploads`

### Biến môi trường backend

```env
APP_NAME=Travel App
DATABASE_URL=postgresql://travel_app_user:YOUR_ENCODED_PASSWORD@YOUR_SERVER.postgres.database.azure.com:5432/travel_app?sslmode=require
DIRECT_URL=postgresql://travel_app_user:YOUR_ENCODED_PASSWORD@YOUR_SERVER.postgres.database.azure.com:5432/travel_app?sslmode=require
JWT_SECRET=your-long-random-secret
NODE_ENV=production
PORT=3000

GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-2.5-flash

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Travel App <no-reply@example.com>

PUBLIC_BASE_URL=https://your-api-domain.example.com
UPLOADS_DIR=/app/uploads
TRUST_PROXY=true
ALLOWED_ORIGINS=
```

### Ghi chú Azure PostgreSQL

- bắt buộc dùng connection string có `sslmode=require`
- `DATABASE_URL` và `DIRECT_URL` hiện đang dùng cùng một server Azure PostgreSQL
- nếu firewall Azure chưa mở, app sẽ fail ở `/health`

## Luồng deploy backend

1. Tạo service trong Coolify từ repo GitHub.
2. Chọn nhánh `deploy`.
3. Khai báo đầy đủ env backend.
4. Mount volume ghi được vào `/app/uploads`.
5. Deploy lần đầu.
6. Container tự chạy `prisma migrate deploy` trước khi start API.
7. Nếu cần dữ liệu demo cho đội test:

```bash
npm run db:seed
```

## Smoke test sau deploy

### Bắt buộc

- đăng ký traveler
- nhận email OTP xác minh
- xác minh email thành công
- đăng nhập thành công
- quên mật khẩu và đặt lại mật khẩu thành công
- chỉnh hồ sơ và upload avatar thành công
- owner tạo / sửa / xóa địa điểm thành công
- owner tạo / sửa / bật tắt / xóa ưu đãi thành công
- AI trip plan trả dữ liệu thật từ Gemini
- `/health` trả `200`

### Kiểm tra bền vững

- restart container xong ảnh upload vẫn truy cập được
- xóa owner xong dữ liệu place / promotion không còn
- token sai hoặc hết hạn trả lỗi đúng

## Build mobile cho APK nội bộ

### Biến môi trường mobile

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.example.com
```

### Lệnh build

```bash
npx eas build --platform android --profile preview
```

### Lưu ý

- profile `preview` xuất APK để test nội bộ
- profile `production` xuất AAB cho giai đoạn phát hành sau
- `android.package` hiện còn dùng package tạm cho APK nội bộ, cần đổi trước khi lên Google Play thật

## Rollback

### Backend

1. checkout commit ổn định gần nhất
2. push commit đó lên `main`
3. chờ `Promote Deploy` đồng bộ lại sang `deploy`
4. Coolify tự redeploy

### Nếu cần rollback ngay trong GitHub

- force-push `deploy` về commit ổn định gần nhất
- sau đó xử lý lại `main` để lịch sử không lệch

## Tài liệu liên quan

- `apps/api/docs/deploy-azure-coolify.md`
- `apps/mobile/README.md`
- `docs/system-architecture.md`
