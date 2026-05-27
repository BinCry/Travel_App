# Backend Feature Permission Matrix

Updated: 2026-05-27

| Tính năng | Anonymous | Traveler | Owner |
| --- | --- | --- | --- |
| Xem danh sách địa điểm | Có | Có | Có |
| Xem chi tiết địa điểm | Có | Có | Có |
| Xem đánh giá công khai | Có | Có | Có |
| Đăng ký tài khoản | Có | Không áp dụng | Không áp dụng |
| Xác minh email | Có | Không áp dụng | Không áp dụng |
| Đăng nhập | Có | Không áp dụng | Không áp dụng |
| Quên mật khẩu OTP | Có | Không áp dụng | Không áp dụng |
| Xem hồ sơ của mình | Không | Có | Có |
| Cập nhật hồ sơ của mình | Không | Có | Có |
| Đổi mật khẩu | Không | Có | Có |
| Xóa tài khoản | Không | Có | Có |
| Lưu địa điểm | Không | Có | Có |
| Xem địa điểm đã lưu | Không | Có | Có |
| Viết/sửa/xóa review của mình | Không | Có | Có |
| Thích review | Không | Có | Có |
| Dùng AI trip plan | Không | Có | Có |
| Upload avatar | Không | Có | Có |
| Upload review image | Không | Có | Có |
| CRUD place của owner | Không | Không | Có |
| CRUD/toggle promotion của owner | Không | Không | Có |
| Upload place cover | Không | Không | Có |

## Guard conditions

- owner không được sửa/xóa place không thuộc `ownerId` của mình
- traveler không được vào owner routes
- account chưa xác minh email không được login
- xóa owner account phải xóa luôn place/promotion liên quan
