import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

function roundRating(value) {
  return Math.round(value * 10) / 10;
}

async function main() {
  const mismatches = [];

  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      averageRating: true,
      ratingCount: true,
    },
    orderBy: { name: "asc" },
  });

  for (const place of places) {
    const aggregate = await prisma.review.aggregate({
      where: { placeId: place.id },
      _avg: { rating: true },
      _count: true,
    });

    const expectedAverage = roundRating(aggregate._avg.rating ?? 0);
    const expectedCount = aggregate._count;

    if (place.averageRating !== expectedAverage || place.ratingCount !== expectedCount) {
      mismatches.push(
        `Place mismatch: ${place.name} stored=${place.averageRating}/${place.ratingCount} expected=${expectedAverage}/${expectedCount}`
      );
    }
  }

  const vouchers = await prisma.voucher.findMany({
    select: {
      id: true,
      code: true,
      usedCount: true,
    },
    orderBy: { code: "asc" },
  });

  for (const voucher of vouchers) {
    const expectedUsedCount = await prisma.booking.count({
      where: {
        voucherId: voucher.id,
        status: {
          notIn: ["REJECTED", "CANCELLED"],
        },
      },
    });

    if (voucher.usedCount !== expectedUsedCount) {
      mismatches.push(
        `Voucher mismatch: ${voucher.code} stored=${voucher.usedCount} expected=${expectedUsedCount}`
      );
    }
  }

  const bookingSummary = await prisma.booking.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  console.info("Audit consistency summary");
  console.info(`- Places checked: ${places.length}`);
  console.info(`- Vouchers checked: ${vouchers.length}`);
  console.info("- Booking counts by status:");
  for (const item of bookingSummary) {
    console.info(`  • ${item.status}: ${item._count.status}`);
  }

  if (mismatches.length > 0) {
    console.error("Phát hiện chênh lệch dữ liệu:");
    for (const mismatch of mismatches) {
      console.error(`- ${mismatch}`);
    }
    process.exitCode = 1;
    return;
  }

  console.info("Không phát hiện chênh lệch aggregate nào.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    void prisma.$disconnect();
    process.exit(1);
  });
