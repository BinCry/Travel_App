# Deploy backend lên Azure VPS bằng Coolify

## Hạ tầng đích

- VPS: Azure
- Quản lý deploy: Coolify
- Database: Azure Database for PostgreSQL
- Uploads: volume local persistent mount vào `/app/uploads`
- Nhánh deploy: `deploy`

## Cấu hình service trong Coolify

- Source: GitHub repository
- Branch: `deploy`
- Build context: repository root
- Dockerfile path: `apps/api/Dockerfile`
- Exposed port: `3000`
- Health check: `/health`
- Persistent volume: `/app/uploads`

## Biến môi trường bắt buộc

```env
APP_NAME=Travel App
DATABASE_URL=postgresql://travel_app_user:YOUR_ENCODED_PASSWORD@YOUR_SERVER.postgres.database.azure.com:5432/travel_app?sslmode=require
DIRECT_URL=postgresql://travel_app_user:YOUR_ENCODED_PASSWORD@YOUR_SERVER.postgres.database.azure.com:5432/travel_app?sslmode=require
JWT_SECRET=your-long-random-secret
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-2.5-flash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Travel App <no-reply@example.com>
PUBLIC_BASE_URL=https://your-api-domain.example.com
UPLOADS_DIR=/app/uploads
TRUST_PROXY=true
ALLOWED_ORIGINS=
```

## Luồng hoạt động CI/CD

1. code được push lên `main`
2. GitHub Actions chạy workflow `CI`
3. khi toàn bộ job pass, workflow `Promote Deploy` push commit đó sang `deploy`
4. Coolify phát hiện thay đổi ở `deploy` và tự redeploy

## Checklist deploy lần đầu

1. Tạo service trong Coolify từ repo GitHub.
2. Chọn nhánh `deploy`.
3. Điền toàn bộ env ở trên.
4. Mount volume ghi được vào `/app/uploads`.
5. Deploy.
6. Xác minh log container đã chạy `prisma migrate deploy`.
7. Nếu cần dữ liệu demo:

```bash
npm run db:seed
```

8. Kiểm tra:
   - `/health`
   - đăng ký + xác minh email
   - quên mật khẩu
   - upload avatar
   - upload ảnh review
   - owner tạo địa điểm
   - AI trip planning

## Ghi chú quan trọng

- Nếu `PUBLIC_BASE_URL` sai, mobile sẽ nhận URL ảnh sai.
- Nếu SMTP không hoạt động, người dùng mới sẽ không thể xác minh email hoặc đặt lại mật khẩu.
- Nếu Gemini credentials sai, API AI sẽ trả `AI_UNAVAILABLE`.
- Nếu volume upload không ghi được, API upload sẽ trả `STORAGE_UNAVAILABLE`.
- Nếu Azure PostgreSQL chưa mở firewall hoặc SSL không đúng, `/health` sẽ fail.
