# Travel App Backend API

Backend Express + Prisma cho Travel App mobile.

## Phạm vi hiện tại

- Auth với email verification OTP.
- Profile, favorites, reviews.
- Owner place/promotion management.
- Trip planner domain.
- Booking/reservation domain.
- Owner review replies và analytics summary.
- Upload avatar, place cover, review images.
- AI trip planning với Gemini.

## Stack

- Node.js 20+
- TypeScript
- Express 5
- Prisma
- PostgreSQL
- Local file storage for uploads

## Local setup

```bash
npm install
npm --prefix apps/api run db:local:up
npm --prefix apps/api run db:sync
npm --prefix apps/api run storage:verify
npm --prefix apps/api run dev
```

Tạo `apps/api/.env` từ `apps/api/.env.example` trước khi chạy API.

## Biến môi trường bắt buộc

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NODE_ENV`
- `PORT`
- `PUBLIC_BASE_URL`
- `UPLOADS_DIR`
- `ALLOWED_ORIGINS`
- `TRUST_PROXY`

Nếu cần auth và AI thật, thêm:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

## Scripts hữu ích

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test
npm --prefix apps/api run test:db
npm --prefix apps/api run db:push
npm --prefix apps/api run db:migrate:deploy
npm --prefix apps/api run db:seed
npm --prefix apps/api run storage:verify
```

## Verify

```bash
npm run verify:api
npm run verify:storage
npm --prefix apps/api run test:db -- --run tests/db/bookings.db.test.ts tests/db/owner.db.test.ts tests/db/trips.db.test.ts
```

## Deploy notes

- Dockerfile production: `apps/api/Dockerfile`
- Upload volume production: `/app/uploads`
- Production PostgreSQL nên dùng `sslmode=require`
- Flow deploy hiện tại được mô tả trong `docs/deployment-guide.md`
