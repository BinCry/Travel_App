# Travel App Mobile

Expo / React Native client for the Travel App monorepo.

## Local setup

1. Install dependencies from the monorepo root:

```bash
npm install
```

2. Create `apps/mobile/.env` from `apps/mobile/.env.example`.

3. Start Expo from the monorepo root:

```bash
npm --prefix apps/mobile run start
```

## API base URL

The app reads the backend URL from `EXPO_PUBLIC_API_BASE_URL`.

Examples:

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator / web: `http://localhost:8000`
- Physical device on the same LAN: `http://<your-lan-ip>:8000`
- Azure VPS / Coolify API: `https://your-api-domain.example.com`

If the env var is missing, the app falls back to emulator-friendly localhost defaults.

## Verification

- `npm --prefix apps/mobile run typecheck`
- `npm --prefix apps/mobile run lint`

## Android builds

`apps/mobile/eas.json` contains two build profiles:

- `preview`: internal Android APK for testing
- `production`: Android App Bundle for store-style release

Example commands:

```bash
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## Notes

- Sau khi đăng ký, người dùng cần nhập OTP xác minh email trước khi đăng nhập vào ứng dụng.
- Upload and auth flows expect the backend to expose absolute URLs through `PUBLIC_BASE_URL`.
- For production demos, point `EXPO_PUBLIC_API_BASE_URL` at the public HTTPS domain served by Coolify.
