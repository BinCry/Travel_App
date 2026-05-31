# Thư mục script và tài nguyên cơ sở dữ liệu

Dùng thư mục này để gom các file liên quan tới cơ sở dữ liệu, không chứa mã máy chủ chính.

## Nội dung

| Mục | Mô tả |
|-----|-------|
| Shell script | Chuỗi thao tác Prisma tái dùng như `db push`, `migrate deploy`, `seed`. |
| Thư mục `sql/` | Script SQL chạy tay trên PostgreSQL, đặt tên với hậu tố `.example.sql`. |

## File SQL cho frontend và kiểm thử tay

| Tệp | Khi chạy |
|-----|-----------|
| [sql/frontend-schema-and-demo-seed.example.sql](sql/frontend-schema-and-demo-seed.example.sql) | Dùng khi DB trống: tạo khung bảng tối thiểu và nạp bộ dữ liệu ví dụ production-like để test UI. |
| [sql/frontend-demo-seed-only.example.sql](sql/frontend-demo-seed-only.example.sql) | Dùng khi khung đã có sẵn: xóa các bản ghi ví dụ `fe_*` rồi nạp lại cùng bộ dữ liệu. |

Tài khoản ví dụ hiện tại:
- Traveler: `linh.nguyen@example.com / travel1234`
- Owner: `minh.host@example.com / travel1234`

Khuyến nghị hằng ngày vẫn dùng:
- `npx prisma db push`
- `npm run db:seed`

Các file SQL chỉ nên dùng khi bạn cần thao tác trực tiếp với PostgreSQL.

## Quy ước môi trường

- Production và staging dùng Azure Database for PostgreSQL.
- Connection string production phải có `sslmode=require`.
- PostgreSQL local chỉ dành cho dev, test hoặc CI cục bộ.

## Thứ tự gợi ý khi mới thiết lập máy

1. Sao chép `.env.example` thành `.env` và điền thông tin kết nối PostgreSQL.
2. Trong gốc dự án, chạy `npm ci` và `npm run db:generate`.
3. Áp schema bằng `npm run db:push`.
4. Nạp dữ liệu production-like bằng `npm run db:seed`.

## Lưu ý

Script shell giả định bạn chạy trong Linux hoặc WSL. Trên máy chỉ có Windows, có thể dùng trực tiếp các lệnh tương ứng trong `package.json`.
