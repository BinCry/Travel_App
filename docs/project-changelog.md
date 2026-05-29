# Nhật ký thay đổi

## 2026-05-29

- thêm domain `trips` với trip CRUD, duplicate trip, trip stop CRUD và reorder stop
- thêm mobile flow `Trips` và `Trip Planner`
- thêm `AI Trip Builder` để sinh suggestion từ AI và lưu thành trip thật
- thêm `ReviewReply` để owner phản hồi review theo đúng quyền sở hữu place
- thêm booking backbone:
  - booking option CRUD
  - availability slot CRUD
  - traveler booking create/list/cancel
  - owner booking status update
- thêm owner analytics summary trên mobile dashboard
- mở rộng shared contracts cho `trips`, `bookings`, `owner analytics`
- thêm DB-backed tests cho trips, bookings và owner permissions
- mở rộng mobile tests cho trips, bookings, AI trip builder, owner management
- cập nhật tài liệu release để phản ánh trạng thái thesis-ready

## 2026-05-28

- thêm GitHub Actions `CI` và `Promote Deploy`
- khóa chiến lược branch `main -> deploy` cho Coolify
- thêm lớp DB-backed backend tests với PostgreSQL thật
- thêm mobile automated tests bằng `jest-expo` và React Native Testing Library
- thêm baseline Android smoke flows bằng Maestro
- thêm request logging cơ bản gồm `requestId`, `status`, `durationMs`
- chuẩn hóa `favorites` mobile API sang parse bằng shared Zod
- cập nhật tài liệu deploy để bám Azure PostgreSQL và Coolify branch `deploy`
