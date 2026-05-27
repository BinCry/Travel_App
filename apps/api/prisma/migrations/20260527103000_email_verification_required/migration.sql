-- AlterTable
ALTER TABLE "User"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EmailVerificationOtp" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailVerificationOtp_email_createdAt_idx" ON "EmailVerificationOtp"("email", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "EmailVerificationOtp_userId_createdAt_idx" ON "EmailVerificationOtp"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "EmailVerificationOtp"
ADD CONSTRAINT "EmailVerificationOtp_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
