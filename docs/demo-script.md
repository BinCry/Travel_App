# Demo Script

Cập nhật: 2026-05-29

## Mục tiêu buổi demo

Trình bày Travel App như một nền tảng du lịch có 2 vai trò:

1. `traveler` khám phá, lập kế hoạch, review và booking.
2. `owner` quản lý place, promotion, review reply, booking và analytics.

## Chuẩn bị trước demo

- Backend local hoặc staging đang chạy ổn.
- Mobile app mở sẵn trên thiết bị thật hoặc Expo Go.
- Có sẵn 2 tài khoản:
  - traveler
  - owner
- Có ít nhất 1 place đã có booking option và slot.

## Kịch bản đề xuất

### Phần 1: Traveler flow

1. Đăng nhập traveler.
2. Vào `Khám phá`, mở chi tiết một địa điểm.
3. Lưu địa điểm vào favorite.
4. Viết một review mới.
5. Vào `AI Trip Builder`, nhập nhu cầu chuyến đi và tạo suggestion.
6. Lưu suggestion thành trip thật.
7. Mở `Trip Planner` để cho thấy stop đã được tạo.
8. Quay lại chi tiết place và tạo booking.
9. Mở `Booking History` để cho thấy booking vừa sinh ra.

### Phần 2: Owner flow

1. Đăng xuất và đăng nhập owner.
2. Vào màn quản lý owner.
3. Cho thấy dashboard analytics:
   - place count
   - booking count
   - review/favorite/rating
   - top places
4. Mở một place đang quản lý.
5. Tạo hoặc chỉnh promotion.
6. Mở phần review và tạo owner reply cho review traveler vừa viết.
7. Mở phần booking management:
   - xem booking vừa được traveler tạo
   - đổi trạng thái booking

### Phần 3: Kết luận kỹ thuật

1. Nêu rõ app dùng chung shared contracts giữa mobile và backend.
2. Nêu rõ có kiểm thử:
   - API integration
   - DB-backed permission/state tests
   - mobile UI/flow tests
3. Mở `/health` hoặc trình bày command verify nếu cần chứng minh độ ổn định.

## Điểm nhấn nên nói khi bảo vệ

- App không chỉ là UI khám phá địa điểm mà đã có luồng dữ liệu hoàn chỉnh cho cả 2 vai trò.
- CRUD đã đầy đủ cho dữ liệu chính.
- Phân quyền được chặn ở backend, không chỉ ở UI.
- AI được dùng để tăng trải nghiệm traveler thay vì chỉ là tính năng trang trí.
- Booking backbone mở đường cho commerce phase sau đồ án.
