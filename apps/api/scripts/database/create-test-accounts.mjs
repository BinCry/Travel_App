import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

function assertReadyConnection() {
  const databaseUrl = process.env.DATABASE_URL || "";
  if (!databaseUrl) {
    throw new Error("Thiếu DATABASE_URL. Hãy điền chuỗi kết nối Azure PostgreSQL thật trong apps/api/.env.");
  }

  if (
    databaseUrl.includes("YOUR_SERVER") ||
    databaseUrl.includes("YOUR_ENCODED_PASSWORD") ||
    databaseUrl.includes("travel_app_user")
  ) {
    throw new Error(
      "DATABASE_URL hiện vẫn là giá trị mẫu. Hãy thay bằng chuỗi Azure PostgreSQL thật rồi chạy lại lệnh tạo tài khoản test.",
    );
  }
}

async function upsertUser({
  email,
  role,
  fullName,
  username,
  location,
  avatarUrl = null,
}) {
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const emailVerifiedAt = new Date();

  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role,
      emailVerifiedAt,
      fullName,
      username,
      location,
      avatarUrl,
    },
    create: {
      email,
      passwordHash,
      role,
      emailVerifiedAt,
      fullName,
      username,
      location,
      avatarUrl,
    },
  });
}

async function main() {
  assertReadyConnection();

  const traveler = await upsertUser({
    email: "demo@example.com",
    role: "TRAVELER",
    fullName: "Alex Johnson",
    username: "Alex_love_travel",
    location: "Việt Nam",
    avatarUrl: "https://th.bing.com/th/id/OIP.iY6OLSZImubhw9Yiwg6OuAHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  });

  const owner = await upsertUser({
    email: "owner@example.com",
    role: "OWNER",
    fullName: "Owner Demo",
    username: "owner_demo",
    location: "Việt Nam",
  });

  console.info("Đã tạo hoặc cập nhật 2 tài khoản test:");
  console.info(`- Traveler: ${traveler.email} / demo1234`);
  console.info(`- Owner: ${owner.email} / demo1234`);
  console.info("Cả hai tài khoản đã được xác minh email và có thể đăng nhập ngay.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    void prisma.$disconnect();
    process.exit(1);
  });
