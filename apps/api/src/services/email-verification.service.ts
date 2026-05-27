import type {
  RegisterPendingResponse,
  ResendVerificationResponse,
  VerifyEmailResponse,
} from "@travel-app/shared/contracts/auth";
import {
  registerPendingResponseSchema,
  resendVerificationRequestSchema,
  resendVerificationResponseSchema,
  verifyEmailRequestSchema,
  verifyEmailResponseSchema,
} from "@travel-app/shared/contracts/auth";
import { prisma } from "../database/client.js";
import { mailService } from "./mail.service.js";
import { signAuthToken } from "./auth-token.js";
import {
  generateOtp,
  hashOtp,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
} from "./otp.js";
import { toAuthUserDto } from "./userDto.js";

async function getLatestOtp(email: string) {
  return prisma.emailVerificationOtp.findFirst({
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
    await prisma.emailVerificationOtp.update({
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

async function createAndSendOtp(user: {
  id: number;
  email: string;
  emailVerifiedAt: Date | null;
}): Promise<void> {
  if (user.emailVerifiedAt) {
    throw Object.assign(new Error("EMAIL_ALREADY_VERIFIED"), { statusCode: 409 });
  }

  if (!mailService.isConfigured()) {
    throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
  }

  const latest = await prisma.emailVerificationOtp.findFirst({
    where: {
      email: user.email,
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
        message: "Vui lòng chờ trước khi yêu cầu mã xác minh mới.",
      },
    });
  }

  const otp = generateOtp();
  const created = await prisma.emailVerificationOtp.create({
    data: {
      userId: user.id,
      email: user.email,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000),
    },
  });

  try {
    await mailService.sendEmailVerificationOtp(user.email, otp);
    await prisma.emailVerificationOtp.updateMany({
      where: {
        email: user.email,
        id: { not: created.id },
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });
  } catch (error) {
    await prisma.emailVerificationOtp.delete({ where: { id: created.id } }).catch(() => undefined);
    throw error;
  }
}

export const emailVerificationService = {
  async createPendingRegistration(user: {
    id: number;
    email: string;
    emailVerifiedAt: Date | null;
  }): Promise<RegisterPendingResponse> {
    await createAndSendOtp(user);
    return registerPendingResponseSchema.parse({
      email: user.email,
      message: "Tài khoản đã được tạo. Vui lòng nhập mã OTP đã gửi về email để hoàn tất xác minh.",
    });
  },

  async resendVerification(body: unknown): Promise<ResendVerificationResponse> {
    const data = resendVerificationRequestSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { statusCode: 404 });
    }

    await createAndSendOtp(user);
    return resendVerificationResponseSchema.parse({
      message: "Đã gửi lại mã xác minh email.",
    });
  },

  async verifyEmail(body: unknown): Promise<VerifyEmailResponse> {
    const data = verifyEmailRequestSchema.parse(body);
    const otp = await assertLatestOtp(data.email, data.otp);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        location: true,
        role: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { statusCode: 404 });
    }

    if (user.emailVerifiedAt) {
      throw Object.assign(new Error("EMAIL_ALREADY_VERIFIED"), { statusCode: 409 });
    }

    const verifiedAt = new Date();
    const [verifiedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: verifiedAt },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
          fullName: true,
          username: true,
          avatarUrl: true,
          location: true,
          role: true,
        },
      }),
      prisma.emailVerificationOtp.update({
        where: { id: otp.id },
        data: { consumedAt: verifiedAt },
      }),
      prisma.emailVerificationOtp.updateMany({
        where: {
          email: data.email,
          id: { not: otp.id },
          consumedAt: null,
        },
        data: { consumedAt: verifiedAt },
      }),
    ]);

    const accessToken = signAuthToken(verifiedUser.id, verifiedUser.email);
    return verifyEmailResponseSchema.parse({
      message: "Xác minh email thành công.",
      accessToken,
      user: toAuthUserDto(verifiedUser),
    });
  },
};
