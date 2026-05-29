# Deployment Checklist

Cập nhật: 2026-05-29

## 1. Chuẩn bị môi trường

- [ ] Có `DATABASE_URL` production hợp lệ.
- [ ] Có `DIRECT_URL` production hợp lệ.
- [ ] Có `JWT_SECRET` đủ mạnh.
- [ ] Có `SMTP_*` credential thật.
- [ ] Có `GEMINI_API_KEY` thật.
- [ ] Có `PUBLIC_BASE_URL` đúng domain API.
- [ ] Có persistent volume cho `/app/uploads`.

## 2. Kiểm tra code trước release

- [ ] `npm run verify:api`
- [ ] `npm run verify:mobile`
- [ ] `npm run test:mobile`
- [ ] `npm run verify:storage`
- [ ] `npm --prefix apps/api run test:db -- --run tests/db/bookings.db.test.ts tests/db/owner.db.test.ts tests/db/trips.db.test.ts`

## 3. Database

- [ ] Backup database hiện tại.
- [ ] Chạy `npm --prefix apps/api run db:migrate:deploy` trên production.
- [ ] Kiểm tra schema đã có `Trip`, `TripStop`, `ReviewReply`, `BookingOption`, `AvailabilitySlot`, `Booking`.

## 4. Smoke test sau deploy

- [ ] Register + verify email.
- [ ] Login traveler.
- [ ] Favorite place.
- [ ] Review place.
- [ ] AI Trip Builder hoạt động.
- [ ] Save AI result thành trip.
- [ ] Create booking.
- [ ] Login owner.
- [ ] Owner reply review.
- [ ] Owner đổi trạng thái booking.
- [ ] Owner dashboard hiển thị analytics.
- [ ] `/health` trả `200`.

## 5. Mobile release

- [ ] `EXPO_PUBLIC_API_BASE_URL` trỏ đúng API.
- [ ] Build Android preview thành công.
- [ ] Test trên thiết bị Android thật.
- [ ] Kiểm tra layout trên màn hình nhỏ.

## 6. Bằng chứng bàn giao

- [ ] Chụp ảnh hoặc quay video traveler flow.
- [ ] Chụp ảnh hoặc quay video owner flow.
- [ ] Lưu commit hash release.
- [ ] Lưu danh sách command verify đã chạy.
