# Travel App Backend API

Backend for the Travel App mobile client.

## Stack

- Node.js 20+
- TypeScript
- Express 5
- Prisma
- Azure Database for PostgreSQL
- Local file storage for uploads

## Local setup

```bash
npm install
npm --prefix apps/api run db:sync
npm --prefix apps/api run storage:verify
npm --prefix apps/api run dev
```

Create `apps/api/.env` from `apps/api/.env.example` before starting the API.

## Required environment variables

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NODE_ENV`
- `PORT`
- `PUBLIC_BASE_URL`
- `UPLOADS_DIR`
- `ALLOWED_ORIGINS`
- `TRUST_PROXY`

`PUBLIC_BASE_URL` must point to the public backend URL so upload endpoints can return absolute image URLs for the mobile app.
Set `TRUST_PROXY=true` when running behind Coolify or another reverse proxy.
`ALLOWED_ORIGINS` is optional and only needed for web clients; native mobile requests can leave it empty.

## Upload storage

- Review and place-cover uploads are stored on local disk.
- Express serves them from `/uploads/*`.
- In Docker or Coolify, mount a persistent volume to `/app/uploads`.
- Run `npm run storage:verify` after deploy to confirm the volume is writable.

## Azure VPS + Coolify

Deployment notes are in `docs/deploy-azure-coolify.md`.

Use these settings in Coolify:

- Dockerfile path: `apps/api/Dockerfile`
- Build context: repository root
- Expose port `3000`
- Add a persistent volume mounted at `/app/uploads`
- Manage `.env` values in Coolify, not in the repository
- Startup command is already handled by the image: it runs `prisma migrate deploy` before the API boots.

## Useful scripts

- `npm run dev`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:migrate:deploy`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:sync`
- `npm run db:studio`
- `npm run storage:verify`
- `npm run test`
- `npm run start:prod`
