# Backend Feature / Permission Matrix

Updated: 2026-05-26

| Capability | Anonymous | Traveler | Owner | Chain impact |
| --- | --- | --- | --- | --- |
| Register / login | Yes | N/A | N/A | Enables JWT identity for all protected features |
| Forgot-password compatibility endpoint | Hidden | Hidden | Hidden | Backward-compatible only; not surfaced in UX |
| Browse places | Yes | Yes | Yes | Drives favorites, reviews, and owner place visibility |
| View place detail | Yes | Yes | Yes | Depends on places, review aggregates, favorite state |
| List place reviews | Yes | Yes | Yes | Depends on places and reviews |
| Create review | No | Yes | Yes | Updates place rating context and user review history |
| Update/delete own review | No | Yes | Yes | Depends on review ownership |
| Toggle review like | No | Yes | Yes | Depends on auth and review existence |
| View/update own profile | No | Yes | Yes | Drives navigation and personalization |
| List/add/remove favorites | No | Yes | Yes | Depends on auth and place existence |
| Upload review image | No | Yes | Yes | Depends on auth, storage, `PUBLIC_BASE_URL` |
| AI trip plan | No | Yes | Yes | Depends on auth, rate limiting, Gemini API |
| Upload place cover | No | No | Yes | Depends on owner role and storage |
| Create/update/delete own place | No | No | Yes | Depends on owner auth, categories, uploads |
| Manage own promotions | No | No | Yes | Depends on owner auth and place ownership |
