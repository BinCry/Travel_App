# Feature Permission Matrix

Cập nhật: 2026-05-29

| Feature | Anonymous | Traveler | Owner |
| --- | --- | --- | --- |
| Xem danh sách place | Có | Có | Có |
| Xem chi tiết place | Có | Có | Có |
| Xem review công khai | Có | Có | Có |
| Đăng ký / đăng nhập | Có | Không | Không |
| Xác minh email OTP | Có, sau đăng ký | Không | Không |
| Cập nhật hồ sơ cá nhân | Không | Có | Có |
| Đổi mật khẩu | Không | Có | Có |
| Xóa tài khoản | Không | Có | Có |
| Lưu / bỏ lưu favorite | Không | Có | Có |
| Tạo / sửa / xóa review của mình | Không | Có | Có |
| Like / unlike review | Không | Có | Có |
| Xem review của chính mình | Không | Có | Có |
| Tạo trip thủ công | Không | Có | Có |
| Sửa / xóa / nhân bản trip của mình | Không | Có | Có |
| Thêm / sửa / xóa trip stop của mình | Không | Có | Có |
| Dùng AI Trip Builder | Không | Có | Có |
| Xem availability của place | Không | Có | Có |
| Tạo booking | Không | Có | Có |
| Hủy booking của mình | Không | Có | Có |
| Xem booking history của mình | Không | Có | Có |
| Tạo place | Không | Không | Có |
| Sửa / xóa place của mình | Không | Không | Có |
| Tạo / sửa / bật tắt / xóa promotion của mình | Không | Không | Có |
| Xem review của place mình | Không | Không | Có |
| Tạo / sửa / xóa owner reply | Không | Không | Có |
| Tạo / sửa / xóa booking option | Không | Không | Có |
| Tạo / sửa / xóa availability slot | Không | Không | Có |
| Xem booking theo place | Không | Không | Có |
| Đổi trạng thái booking | Không | Không | Có |
| Xem owner analytics | Không | Không | Có |

## Quy tắc cưỡng chế quyền

- Traveler chỉ thao tác được trên dữ liệu cá nhân của mình.
- Owner có toàn bộ quyền traveler nhưng chỉ thao tác được trên place và tài nguyên do mình sở hữu.
- Owner không thể sửa, xóa hoặc đổi trạng thái dữ liệu thuộc owner khác.
- Anonymous không có mutation route nào ngoài auth flow.
