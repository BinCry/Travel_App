# Deployment Readiness Checklist

Updated: 2026-05-26

## Backend

- [x] Root-context Docker build path documented
- [x] Prisma migrate-on-start configured
- [x] PostgreSQL env variables documented
- [x] Upload volume path documented
- [x] Health endpoint checks database and storage
- [x] OpenAPI document generated from code
- [x] AI env variables documented

## Mobile

- [x] `EXPO_PUBLIC_API_BASE_URL` documented
- [x] Android package id configured
- [x] `eas.json` preview profile configured
- [x] `eas.json` production profile configured
- [x] Traveler profile flows surfaced
- [x] Owner place management surfaced

## Before live VPS handoff

- [ ] Run `npm run verify:api`
- [ ] Run `npm run verify:mobile`
- [ ] Run `npm run verify:storage`
- [ ] Deploy backend with real Coolify env values
- [ ] Run `/health` on live domain
- [ ] Verify upload volume survives restart
- [ ] Run one Android preview build against live API
