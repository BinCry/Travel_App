# Travel App Mobile

Ứng dụng Expo / React Native của Travel App.

## Phạm vi hiện tại

- Auth: login, register, verify email, forgot/reset password.
- Explore: place list, place detail, favorites, reviews.
- Trips: trip list, trip planner, AI Trip Builder.
- Booking: booking checkout, booking history.
- Owner: owner dashboard, place management, booking management, analytics summary.

## Cài đặt local

1. Cài dependency từ root:

```bash
npm install
```

2. Tạo `apps/mobile/.env` từ `apps/mobile/.env.example`.

3. Chạy Expo:

```bash
npm --prefix apps/mobile run start:lan
```

## Biến môi trường

```env
EXPO_PUBLIC_API_BASE_URL=auto
```

Giá trị khuyến nghị:

- Máy thật cùng LAN: `auto`
- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- Staging / production: `https://your-api-domain.example.com`

## Kiểm tra chất lượng

```bash
npm --prefix apps/mobile run typecheck
npm --prefix apps/mobile run lint
npm --prefix apps/mobile run test
```

Hiện có test cho:

- login
- register
- verify email
- delete account
- profile/avatar
- saved places
- owner management
- trips
- AI Trip Builder
- bookings

## Build Android

```bash
npx eas build --platform android --profile preview
```

## Maestro smoke tests

```bash
maestro test apps/mobile/.maestro/traveler-smoke.yaml
```

## Lưu ý release

- Sau khi đăng ký, user phải xác minh email trước khi dùng app đầy đủ.
- Preview/production build phải dùng `EXPO_PUBLIC_API_BASE_URL` trỏ tới HTTPS API public.
- `android.package` vẫn là package nội bộ, cần đổi trước khi phát hành Google Play thật.
