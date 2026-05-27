import { createHash, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import type {
  ForgotPasswordResponse,
  ForgotPasswordVerifyResponse,
  ResetPasswordResponse,
} from "@travel-app/shared/contracts/auth";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResponseSchema,
  forgotPasswordVerifyRequestSchema,
  forgotPasswordVerifyResponseSchema,
  resetPasswordRequestSchema,
  resetPasswordResponseSchema,
} from "@travel-app/shared/contracts/auth";
import { prisma } from "../database/client.js";
import { mailService } from "./mail.service.js";
import { assertStrongPassword } from "./password-policy.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MS = 60_000;
const OTP_MAX_ATTEMPTS = 5;

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function getLatestOtp(email: string) {
  return prisma.passwordResetOtp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
}

async function assertLatestOtp(email: string, otp: string) {
  const latest = await getLatestOtp(email);
  if (!latest || latest.consumedAt) {
    throw Object.assign(new Error("OTP_INVALID"), { statusCode: 400 });
  }
  if (latest.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error("OTP_EXPIRED"), { statusCode: 400 });
  }
  if (latest.attempts >= OTP_MAX_ATTEMPTS) {
    throw Object.assign(new Error("OTP_INVALID"), { statusCode: 400 });
  }
  if (latest.codeHash !== hashOtp(otp)) {
    const attempts = latest.attempts + 1;
    await prisma.passwordResetOtp.update({
      where: { id: latest.id },
      data: {
        attempts,
        ...(attempts >= OTP_MAX_ATTEMPTS ? { consumedAt: new Date() } : {}),
      },
    });
    throw Object.assign(new Error("OTP_INVALID"), { statusCode: 400 });
  }
  return latest;
}

export const passwordResetService = {
  async requestReset(body: unknown): Promise<ForgotPasswordResponse> {
    const data = forgotPasswordRequestSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { statusCode: 404 });
    }

    if (!mailService.isConfigured()) {
      throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
    }

    const latest = await prisma.passwordResetOtp.findFirst({
      where: {
        email: data.email,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (latest && latest.createdAt.getTime() + OTP_RESEND_COOLDOWN_MS > Date.now()) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((latest.createdAt.getTime() + OTP_RESEND_COOLDOWN_MS - Date.now()) / 1000)
      );
      throw Object.assign(new Error("RATE_LIMITED"), {
        statusCode: 429,
        issues: {
          retryAfterSeconds,
          message: "Vui lòng chờ trước khi yêu cầu OTP mới.",
        },
      });
    }

    const otp = generateOtp();
    const created = await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        email: user.email,
        codeHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000),
      },
    });

    try {
      await mailService.sendPasswordResetOtp(user.email, otp);
      await prisma.passwordResetOtp.updateMany({
        where: {
          email: user.email,
          id: { not: created.id },
          consumedAt: null,
        },
        data: { consumedAt: new Date() },
      });
    } catch (error) {
      await prisma.passwordResetOtp.delete({ where: { id: created.id } }).catch(() => undefined);
      throw error;
    }

    return forgotPasswordResponseSchema.parse({
      message: "Đã gửi mã OTP.",
    });
  },

  async verifyOtp(body: unknown): Promise<ForgotPasswordVerifyResponse> {
    const data = forgotPasswordVerifyRequestSchema.parse(body);
    const otp = await assertLatestOtp(data.email, data.otp);
    await prisma.passwordResetOtp.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });
    return forgotPasswordVerifyResponseSchema.parse({
      message: "Xác thực OTP thành công.",
    });
  },

  async resetPassword(body: unknown): Promise<ResetPasswordResponse> {
    const data = resetPasswordRequestSchema.parse(body);
    assertStrongPassword(data.newPassword);
    const otp = await assertLatestOtp(data.email, data.otp);
    if (!otp.verifiedAt) {
      throw Object.assign(new Error("OTP_INVALID"), { statusCode: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { statusCode: 404 });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetOtp.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return resetPasswordResponseSchema.parse({
      message: "Đặt lại mật khẩu thành công.",
    });
  },
};
