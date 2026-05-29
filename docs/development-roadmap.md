# Development Roadmap

Updated: 2026-05-29

## Thesis-ready scope completed

### Phase 0: Core stability

- Email verification bắt buộc trước khi dùng app đầy đủ.
- Resend OTP và reset password bằng OTP.
- Delete account cho traveler và owner.
- Request logging, storage verify và OpenAPI generation.
- Shared Zod contracts cho mobile và backend.

### Phase 1: Traveler experience

- Explore places theo category.
- Save/remove favorites.
- Review CRUD và like review.
- Trip planner:
  - trip CRUD
  - duplicate trip
  - trip stop CRUD
  - stop reorder
- AI Trip Builder:
  - nhập yêu cầu
  - lấy suggestion
  - lưu suggestion thành trip thật

### Phase 2: Owner experience

- Owner place CRUD.
- Promotion CRUD và toggle active state.
- Review reply management cho owner.
- Owner analytics summary trong mobile dashboard.

### Phase 3: Reservation backbone

- Booking option CRUD cho owner.
- Availability slot CRUD cho owner.
- Traveler booking create/list/cancel.
- Owner booking list và status update.
- Chặn overbook ở backend.

### Phase 4: QA and release hardening

- Integration tests cho auth, owner, trips, bookings, AI.
- DB-backed tests cho permission và stateful flows.
- Mobile tests cho auth, profile, trips, bookings, AI builder, owner management.
- Storage verify cho upload path.

## Current status

Travel App hiện đã đủ mạnh để bảo vệ đồ án với narrative rõ ràng:

1. Traveler khám phá địa điểm.
2. Traveler lập kế hoạch bằng AI hoặc thủ công.
3. Traveler đặt chỗ cho trải nghiệm.
4. Owner vận hành place, promotion và booking.
5. Owner phản hồi review và theo dõi analytics.

## Remaining work after thesis

Các mục dưới đây là mở rộng sau đồ án, không còn là blocker cho bản release hiện tại:

- Payment integration thật với SePay/VietQR hoặc Stripe.
- Notification center trong app.
- Collection, journal, check-in và gamification sâu hơn.
- Analytics chi tiết hơn theo thời gian.
- Production deployment với credential thật cho SMTP và Gemini.
- EAS preview/production build pipeline hoàn chỉnh.
