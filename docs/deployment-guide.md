# Hướng dẫn deploy Travel App

Cập nhật: 2026-05-29

## Mục tiêu deploy

- Backend chạy trên `Azure VPS`.
- Quản lý deploy bằng `Coolify`.
- Database dùng `Azure Database for PostgreSQL`.
- Upload lưu ở persistent volume.
- Mobile build bằng `EAS`.

## Branch strategy

- `main`: nhánh phát triển chính.
- `deploy`: nhánh backend production nếu vẫn dùng flow Coolify hiện tại.

## Backend environment variables

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

## Coolify service

- Build source: GitHub repo
- Branch: `deploy`
- Build context: repo root
- Dockerfile: `apps/api/Dockerfile`
- Port: `3000`
- Health endpoint: `/health`
- Upload volume: mount vào `/app/uploads`

## Database notes

- Production PostgreSQL phải dùng `sslmode=require`.
- Local dev hiện có thể sync schema bằng `npm --prefix apps/api run db:push`.
- Production phải dùng `npm --prefix apps/api run db:migrate:deploy`.

## Release commands

### Backend verification

```bash
npm run verify:api
npm run verify:storage
```

### DB-backed verification

```bash
npm --prefix apps/api run test:db -- --run tests/db/bookings.db.test.ts tests/db/owner.db.test.ts tests/db/trips.db.test.ts
```

### Mobile verification

```bash
npm run verify:mobile
npm run test:mobile
```

## Smoke test sau deploy

### Auth

- Đăng ký traveler.
- Nhận OTP email và xác minh thành công.
- Đăng nhập thành công.
- Quên mật khẩu và đặt lại mật khẩu thành công.

### Traveler flow

- Xem danh sách địa điểm và vào chi tiết.
- Lưu một địa điểm yêu thích.
- Tạo một review.
- Tạo trip thủ công.
- Tạo trip bằng AI và lưu vào tài khoản.
- Tạo booking và xem booking history.
- Hủy booking vừa tạo.

### Owner flow

- Đăng nhập owner.
- Tạo place mới.
- Tạo promotion mới.
- Tạo booking option và availability slot.
- Xem booking của place.
- Đổi trạng thái booking.
- Tạo owner reply cho review.
- Xem analytics summary ở owner dashboard.

### System checks

- `/health` trả `200`.
- Upload avatar hoặc place image thành công.
- Restart container xong ảnh upload vẫn truy cập được.

## Mobile build

### Mobile env

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.example.com
```

### Build Android preview

```bash
npx eas build --platform android --profile preview
```

## Rollback

### Code rollback

1. Checkout commit ổn định gần nhất.
2. Push lại lên `main`.
3. Đồng bộ lại sang `deploy`.
4. Chờ Coolify redeploy.

### Database rollback

- Chỉ rollback migration nếu có kế hoạch dữ liệu rõ ràng.
- Với migration mới liên quan `trips`, `review replies`, `bookings`, cần backup database trước khi rollback.

## Tài liệu liên quan

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/feature-permission-matrix.md`
- `docs/demo-script.md`
