# Maestro smoke flows

Các flow trong thư mục này dùng để kiểm tra nhanh bản APK nội bộ sau khi build hoặc sau khi app đã trỏ về backend trên Azure VPS.

## Điều kiện trước khi chạy

- đã cài `maestro`
- đã cài APK preview lên thiết bị hoặc emulator
- backend đã chạy ổn định
- email test và dữ liệu owner/traveler đã sẵn sàng

## Flow hiện có

- `traveler-smoke.yaml`
- `owner-smoke.yaml`
- `account-recovery-smoke.yaml`

## Cách chạy

```bash
maestro test apps/mobile/.maestro/traveler-smoke.yaml
maestro test apps/mobile/.maestro/owner-smoke.yaml
maestro test apps/mobile/.maestro/account-recovery-smoke.yaml
```

## Lưu ý

- Các flow này là baseline để đội manual test tiếp tục mở rộng.
- Nếu text hiển thị trên UI thay đổi, selector bằng text trong Maestro cũng cần cập nhật theo.
