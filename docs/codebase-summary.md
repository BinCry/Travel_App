# Tóm tắt codebase Travel App

Cập nhật: 2026-05-29

## Mục tiêu sản phẩm

Travel App là ứng dụng khám phá du lịch trên mobile với 2 vai trò công khai:

- `traveler`: khám phá địa điểm, lưu yêu thích, viết review, lập hành trình, dùng AI và đặt chỗ.
- `owner`: có toàn bộ quyền của traveler và thêm quyền quản lý địa điểm, ưu đãi, booking, phản hồi review và xem analytics.

Phạm vi hiện tại đã đủ để demo đồ án theo hướng `travel discovery + trip planning + reservation + owner growth`.

## Cấu trúc monorepo

- `apps/api`: backend Express + TypeScript + Prisma.
- `apps/mobile`: ứng dụng Expo / React Native.
- `packages/shared`: shared contracts bằng Zod, response envelope, error code và type dùng chung.

## Tính năng đã hoàn thiện

### Anonymous

- Xem danh sách địa điểm công khai.
- Xem chi tiết địa điểm và review công khai.
- Không có quyền mutation.

### Traveler

- Đăng ký, xác minh email bằng OTP, đăng nhập, quên mật khẩu, đổi mật khẩu, xóa tài khoản.
- Xem và cập nhật hồ sơ cá nhân, avatar.
- Duyệt địa điểm theo danh mục `attractions | dining | festivals`.
- Lưu và bỏ lưu địa điểm yêu thích.
- Tạo, sửa, xóa review của chính mình.
- Xem danh sách review đã viết.
- Tạo hành trình thủ công:
  - tạo, sửa, xóa, nhân bản trip
  - thêm, sửa, xóa, sắp xếp lại trip stop
- Tạo hành trình bằng AI:
  - nhập nhu cầu chuyến đi
  - nhận suggestion từ Gemini
  - lưu suggestion thành trip thật trong hệ thống
- Đặt chỗ:
  - xem booking option và availability slot của địa điểm
  - tạo booking
  - xem lịch sử booking
  - hủy booking khi còn hợp lệ

### Owner

- Có toàn bộ quyền của traveler.
- Quản lý địa điểm thuộc sở hữu của mình:
  - tạo, sửa, xóa place
  - cập nhật ảnh bìa, thông tin mô tả
- Quản lý promotion:
  - tạo, sửa, bật/tắt, xóa ưu đãi
- Quản lý review:
  - xem review theo place
  - tạo, sửa, xóa phản hồi owner cho review
- Quản lý booking:
  - tạo, sửa, xóa booking option
  - tạo, sửa, xóa availability slot
  - xem booking theo place
  - đổi trạng thái booking
- Xem analytics tổng quan:
  - số lượng place
  - promotion đang bật
  - booking theo trạng thái
  - review, favorite, average rating
  - top places nổi bật

## Domain backend hiện có

- `auth`: register, login, verify email OTP, resend OTP, forgot/reset password.
- `users`: profile, password change, delete account, self review list, saved places.
- `places`: place list, place detail, place reviews.
- `reviews`: CRUD review, like/unlike review.
- `favorites`: add/remove favorite.
- `owner`: place CRUD, promotion CRUD, review reply CRUD, analytics summary.
- `trips`: trip CRUD, duplicate trip, trip stop CRUD, reorder stop.
- `bookings`: place availability, booking create/list/cancel, owner booking operations.
- `uploads`: avatar, place cover, review image uploads.
- `ai`: trip planning suggestion with Gemini.
- `health`: database and uploads health checks.

## Shared contracts hiện có

- `auth`
- `ai`
- `owner`
- `places`
- `reviews`
- `bookings`
- `trips`
- `uploads`
- `users`

Tất cả mobile API client đều parse response bằng contract từ `packages/shared`.

## Phân quyền

| Hành vi | Anonymous | Traveler | Owner |
| --- | --- | --- | --- |
| Xem place/review công khai | Có | Có | Có |
| Quản lý hồ sơ cá nhân | Không | Có | Có |
| Favorite địa điểm | Không | Có | Có |
| Viết/sửa/xóa review của mình | Không | Có | Có |
| Tạo/sửa/xóa trip của mình | Không | Có | Có |
| Dùng AI trip builder | Không | Có | Có |
| Tạo và hủy booking của mình | Không | Có | Có |
| Tạo/sửa/xóa place | Không | Không | Có, chỉ dữ liệu của mình |
| Tạo/sửa/xóa promotion | Không | Không | Có, chỉ dữ liệu của mình |
| Phản hồi review bằng owner reply | Không | Không | Có, chỉ place của mình |
| Quản lý option/slot/booking owner | Không | Không | Có, chỉ place của mình |
| Xem owner analytics | Không | Không | Có |

## Trạng thái kiểm thử

### API

- `npm run verify:api`
- 67 test integration/unit pass.

### DB-backed API

- `npm --prefix apps/api run test:db -- --run tests/db/bookings.db.test.ts tests/db/owner.db.test.ts tests/db/trips.db.test.ts`
- 11 test DB-backed pass cho permission và nghiệp vụ có trạng thái.

### Mobile

- `npm run verify:mobile`
- `npm run test:mobile`
- 26 test pass cho auth, profile, owner management, bookings, trips, AI trip builder và avatar/UI logic.

### Storage

- `npm run verify:storage`
- Kiểm tra được quyền ghi thư mục upload.

## Trạng thái đồ án

- Codebase hiện ở mức `demo-ready` cho đồ án:
  - có phân quyền rõ ràng
  - có CRUD dữ liệu chính
  - có AI flow
  - có booking flow
  - có owner analytics
- Chưa được xem là production-live hoàn tất nếu chưa gắn credential thật cho:
  - SMTP
  - Gemini
  - môi trường deploy production

## Ghi chú môi trường local

- Local API đang dùng `.env` trong `apps/api`.
- Local DB dev hiện được sync ổn bằng `npm --prefix apps/api run db:push`.
- File log tạm `apps/api/dev-server.log` không thuộc phạm vi release.
