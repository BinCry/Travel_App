# Risk Register

Updated: 2026-05-27

| Rủi ro | Mức độ | Trạng thái | Hướng xử lý |
| --- | --- | --- | --- |
| SMTP production cấu hình sai làm đăng ký/quên mật khẩu không dùng được | Cao | Chưa xác nhận live | Test hộp thư thật sau deploy |
| Gemini key/model sai hoặc quota thấp | Trung bình | Chưa xác nhận live | Smoke test `POST /ai/trip-plan` trên VPS |
| Upload volume không bền sau restart container | Cao | Chưa xác nhận live | Kiểm tra lại volume Coolify + smoke test restart |
| Chưa có DB-backed tests nên có thể còn sai khác giữa mock và PostgreSQL thật | Cao | Còn mở | Bổ sung integration test với DB thật |
| Chưa có mobile automated tests nên regression UI có thể lọt | Trung bình | Còn mở | Thêm `jest-expo` + screen tests |

