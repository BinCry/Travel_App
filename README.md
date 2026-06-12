# ✈️ Travel App

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Travel App là một ứng dụng du lịch toàn diện cho phép người dùng khám phá địa điểm, quản lý chuyến đi, đặt chỗ và chia sẻ trải nghiệm[cite: 11].

---

## 🏗️ Kiến trúc Monorepo

Dự án được xây dựng theo kiến trúc monorepo để tối ưu hóa việc chia sẻ mã nguồn và quản lý tài nguyên[cite: 11]:

*   **`apps/api`**: Backend API sử dụng Node.js, TypeScript và Prisma ORM[cite: 11].
*   **`apps/mobile`**: Ứng dụng di động được phát triển bằng React Native (Expo)[cite: 11].
*   **`packages/shared`**: Nơi chứa các logic, kiểu dữ liệu (contracts) và cấu hình dùng chung giữa API và Mobile[cite: 11].

---

## 🚀 Tính năng chính

*   **Quản lý chuyến đi**: Xây dựng lộ trình (Trip Builder) với sự hỗ trợ từ AI[cite: 11].
*   **Quản lý địa điểm & Đặt chỗ**: Hệ thống đặt chỗ (bookings), quản lý địa điểm và các chương trình khuyến mãi[cite: 11].
*   **Xã hội hóa**: Hệ thống đánh giá (reviews), phản hồi đánh giá và lưu trữ bộ sưu tập địa điểm (collections)[cite: 11].
*   **Hệ thống thông báo**: Thông báo cập nhật địa điểm và các tin tức liên quan[cite: 11].
*   **Bảo mật & Người dùng**: Quản lý vai trò (roles), xác thực email và phục hồi mật khẩu qua OTP[cite: 11].

---

## 🛠️ Công nghệ & Công cụ

*   **Database**: PostgreSQL[cite: 11].
*   **ORM**: Prisma[cite: 11].
*   **AI Integration**: Tích hợp Google Gemini để hỗ trợ người dùng xây dựng chuyến đi[cite: 11].
*   **CI/CD**: Tự động hóa triển khai qua GitHub Actions[cite: 11].
*   **Testing**: Vitest (Unit & Integration tests) và Maestro (Mobile UI smoke tests)[cite: 11].

---

## 📚 Tài liệu chi tiết
Ní có thể tìm thấy hướng dẫn chi tiết trong thư mục `docs/`:
- 🗺️ [Kiến trúc hệ thống](docs/system-architecture.md)
- 🚀 [Hướng dẫn triển khai](docs/deployment-guide.md)
- 📝 [Changelog dự án](docs/project-changelog.md)

---
