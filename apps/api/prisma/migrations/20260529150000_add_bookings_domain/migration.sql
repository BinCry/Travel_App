-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM (
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
  'REFUND_PENDING',
  'REFUNDED'
);

-- CreateTable
CREATE TABLE "BookingOption" (
  "id" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "priceLabel" TEXT,
  "durationMinutes" INTEGER NOT NULL DEFAULT 90,
  "maxPartySize" INTEGER NOT NULL DEFAULT 2,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BookingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
  "id" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
  "id" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  "slotId" TEXT NOT NULL,
  "travelerId" INTEGER NOT NULL,
  "partySize" INTEGER NOT NULL,
  "note" TEXT,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "cancelledAt" TIMESTAMP(3),

  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingOption_placeId_createdAt_idx" ON "BookingOption"("placeId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AvailabilitySlot_optionId_startAt_idx" ON "AvailabilitySlot"("optionId", "startAt");

-- CreateIndex
CREATE INDEX "Booking_travelerId_createdAt_idx" ON "Booking"("travelerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Booking_placeId_createdAt_idx" ON "Booking"("placeId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Booking_slotId_status_idx" ON "Booking"("slotId", "status");

-- AddForeignKey
ALTER TABLE "BookingOption"
ADD CONSTRAINT "BookingOption_placeId_fkey"
FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot"
ADD CONSTRAINT "AvailabilitySlot_optionId_fkey"
FOREIGN KEY ("optionId") REFERENCES "BookingOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_placeId_fkey"
FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_optionId_fkey"
FOREIGN KEY ("optionId") REFERENCES "BookingOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_slotId_fkey"
FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_travelerId_fkey"
FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
