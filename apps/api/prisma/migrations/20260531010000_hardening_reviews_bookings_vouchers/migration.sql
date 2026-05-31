-- CreateEnum
CREATE TYPE "VoucherDiscountType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "Review"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Review"
SET "updatedAt" = "createdAt";

ALTER TABLE "Review"
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BookingOption"
ADD COLUMN "basePriceAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'VND';

-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "voucherId" TEXT,
ADD COLUMN "ownerDecisionNote" TEXT,
ADD COLUMN "cancellationReason" TEXT,
ADD COLUMN "unitPriceAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "subtotalAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "discountAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "finalAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'VND',
ADD COLUMN "appliedVoucherCode" TEXT,
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "rejectedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "noShowAt" TIMESTAMP(3),
ADD COLUMN "refundPendingAt" TIMESTAMP(3),
ADD COLUMN "refundedAt" TIMESTAMP(3);

UPDATE "Booking" AS b
SET
  "unitPriceAmount" = bo."basePriceAmount",
  "subtotalAmount" = bo."basePriceAmount",
  "finalAmount" = bo."basePriceAmount",
  "currency" = bo."currency"
FROM "BookingOption" AS bo
WHERE b."optionId" = bo."id";

UPDATE "Booking"
SET "confirmedAt" = COALESCE("updatedAt", "createdAt")
WHERE "status" = 'CONFIRMED' AND "confirmedAt" IS NULL;

UPDATE "Booking"
SET "rejectedAt" = COALESCE("updatedAt", "createdAt")
WHERE "status" = 'REJECTED' AND "rejectedAt" IS NULL;

UPDATE "Booking"
SET "cancelledAt" = COALESCE("cancelledAt", "updatedAt", "createdAt")
WHERE "status" = 'CANCELLED';

UPDATE "Booking"
SET "completedAt" = COALESCE("updatedAt", "createdAt")
WHERE "status" = 'COMPLETED' AND "completedAt" IS NULL;

UPDATE "Booking"
SET "noShowAt" = COALESCE("updatedAt", "createdAt")
WHERE "status" = 'NO_SHOW' AND "noShowAt" IS NULL;

UPDATE "Booking"
SET "refundPendingAt" = COALESCE("updatedAt", "createdAt")
WHERE "status" = 'REFUND_PENDING' AND "refundPendingAt" IS NULL;

UPDATE "Booking"
SET "refundedAt" = COALESCE("updatedAt", "createdAt")
WHERE "status" = 'REFUNDED' AND "refundedAt" IS NULL;

-- CreateTable
CREATE TABLE "BookingStatusHistory" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "status" "BookingStatus" NOT NULL,
  "note" TEXT,
  "actorRole" "UserRole",
  "actorUserId" INTEGER,
  "actorName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
  "id" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "optionId" TEXT,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "discountType" "VoucherDiscountType" NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "maxDiscountAmount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BookingStatusHistory" ("id", "bookingId", "status", "note", "actorRole", "actorUserId", "actorName", "createdAt")
SELECT
  gen_random_uuid()::text,
  "id",
  "status",
  "note",
  'TRAVELER'::"UserRole",
  "travelerId",
  'Khách du lịch',
  "createdAt"
FROM "Booking";

-- CreateIndex
CREATE UNIQUE INDEX "Review_placeId_userId_key" ON "Review"("placeId", "userId");

-- CreateIndex
CREATE INDEX "Booking_voucherId_idx" ON "Booking"("voucherId");

-- CreateIndex
CREATE INDEX "BookingStatusHistory_bookingId_createdAt_idx" ON "BookingStatusHistory"("bookingId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_placeId_createdAt_idx" ON "Voucher"("placeId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Voucher_optionId_createdAt_idx" ON "Voucher"("optionId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_voucherId_fkey"
FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory"
ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher"
ADD CONSTRAINT "Voucher_placeId_fkey"
FOREIGN KEY ("placeId") REFERENCES "Place"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher"
ADD CONSTRAINT "Voucher_optionId_fkey"
FOREIGN KEY ("optionId") REFERENCES "BookingOption"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
