# Azure VPS + Coolify Deployment

## Stack

- App host: Azure VPS
- Process / deployment manager: Coolify
- Database: Azure Database for PostgreSQL
- File uploads: local persistent volume mounted to `/app/uploads`

## Coolify service settings

- Build source: GitHub repo
- Branch: your deployment branch
- Build context: repository root
- Dockerfile path: `apps/api/Dockerfile`
- Exposed port: `3000`
- Persistent volume: mount a writable volume to `/app/uploads`
- Health check: use the container `HEALTHCHECK` or point Coolify to `/health`

## Required environment variables

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

## First deploy checklist

1. Create the Coolify service from GitHub.
2. Add the env vars above in Coolify.
3. Attach a persistent volume to `/app/uploads`.
4. Deploy once. The container runs `prisma migrate deploy` automatically before it starts the API.
5. If you want demo data, open a terminal in the running service and run:

```bash
npm run db:seed
```

6. Run `npm run storage:verify` inside the container if you need to confirm the upload volume is writable.
7. Set `EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.example.com` in the mobile app build environment before generating Android preview/production builds.

## Behavior notes

- Upload endpoints now write files to local disk and return absolute URLs based on `PUBLIC_BASE_URL`.
- Auth now requires email verification, so SMTP must work in production before users can register and log in.
- If `PUBLIC_BASE_URL` is wrong, mobile clients will receive invalid image URLs.
- If the volume is missing or read-only, uploads return `STORAGE_UNAVAILABLE`.
- `/health` returns `503` when either PostgreSQL or local storage is unavailable, which is useful for Coolify restarts and monitoring.
- `/api/v1/ai/trip-plan` returns `AI_UNAVAILABLE` when Gemini credentials are missing or the provider is unavailable, and `AI_RATE_LIMITED` when the provider throttles requests.
