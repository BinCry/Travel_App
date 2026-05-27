# Travel App Mobile

Ứng dụng di động Expo / React Native của Travel App.

## Cài đặt local

1. Cài dependency từ root:

```bash
npm install
```

2. Tạo file `apps/mobile/.env` từ `apps/mobile/.env.example`.

3. Chạy ứng dụng:

```bash
npm --prefix apps/mobile run start
```

## Biến môi trường

Ứng dụng đọc API từ:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.example.com
```

Ví dụ:

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- máy thật cùng mạng LAN: `http://<your-lan-ip>:8000`
- Azure VPS / Coolify: `https://your-api-domain.example.com`

## Kiểm tra chất lượng

### Typecheck và lint

```bash
npm --prefix apps/mobile run typecheck
npm --prefix apps/mobile run lint
```

### Test màn hình

```bash
npm --prefix apps/mobile run test
```

Hiện đã có test cho:

- đăng nhập
- đăng ký
- xác minh email
- xóa tài khoản
- địa điểm đã lưu
- quản lý địa điểm của owner

## Build APK nội bộ

`apps/mobile/eas.json` hiện có 2 profile:

- `preview`: build APK nội bộ
- `production`: build AAB cho giai đoạn phát hành sau

Lệnh build APK:

```bash
npx eas build --platform android --profile preview
```

## Maestro smoke test

Các flow kiểm thử Android mẫu nằm trong:

```text
apps/mobile/.maestro
```

Ví dụ chạy:

```bash
maestro test apps/mobile/.maestro/traveler-smoke.yaml
```

## Lưu ý phát hành

- sau khi đăng ký, người dùng phải xác minh email trước khi đăng nhập
- mobile cần `EXPO_PUBLIC_API_BASE_URL` trỏ tới domain HTTPS public của backend
- `android.package` hiện dùng cho APK nội bộ, cần đổi trước khi lên Google Play thật
