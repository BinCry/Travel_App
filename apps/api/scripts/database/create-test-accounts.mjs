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
  const passwordHash = await bcrypt.hash("travel1234", 10);
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
    email: "linh.nguyen@example.com",
    role: "TRAVELER",
    fullName: "Linh Nguyễn",
    username: "linhnguyen",
    location: "Đà Nẵng",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  });

  const owner = await upsertUser({
    email: "minh.host@example.com",
    role: "OWNER",
    fullName: "Minh Trần",
    username: "minhhost",
    location: "Hội An",
  });

  console.info("Đã tạo hoặc cập nhật 2 tài khoản test:");
  console.info(`- Traveler: ${traveler.email} / travel1234`);
  console.info(`- Owner: ${owner.email} / travel1234`);
  console.info("Cả hai tài khoản đã được xác minh email và có thể đăng nhập ngay.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    void prisma.$disconnect();
    process.exit(1);
  });
