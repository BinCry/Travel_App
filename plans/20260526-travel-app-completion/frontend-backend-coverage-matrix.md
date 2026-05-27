# Frontend / Backend Coverage Matrix

Updated: 2026-05-26

| Mobile screen / flow | Backend endpoint group | Status | Notes |
| --- | --- | --- | --- |
| Login / Register | `/auth` | Complete | Email/password only |
| Home browse | `/places` | Complete | Uses canonical categories |
| Place detail | `/places/:id` | Complete | Favorite state included when authenticated |
| All reviews | `/places/:id/reviews`, `/reviews/:id/likes/toggle` | Complete | Review creation and likes live |
| Saved Places | `/users/me/favorites` | Complete | Can remove favorite and open detail |
| Your Reviews | `/users/me/reviews`, `/reviews/:id` | Complete | Delete review supported |
| Edit Profile | `/users/me` | Complete | Shared user contract |
| Owner place list | `/owner/places` | Complete | Refreshes on focus |
| Add Location | `/owner/places`, `/uploads/place-cover` | Complete | Canonical categories only |
| Manage Place | `/owner/places/:id`, `/owner/promotions/*` | Complete | Update/delete place and promotion CRUD/toggle |
| AI Planner | `/ai/trip-plan` | Complete | Requires live Gemini env in production |
