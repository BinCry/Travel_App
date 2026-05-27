import bcrypt from "bcryptjs";
import type {
  AuthResponse,
  ForgotPasswordResponse,
  RegisterPendingResponse,
} from "@travel-app/shared/contracts/auth";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
} from "@travel-app/shared/contracts/auth";
import { prisma } from "../database/client.js";
import { emailVerificationService } from "./email-verification.service.js";
import { assertStrongPassword } from "./password-policy.js";
import { signAuthToken } from "./auth-token.js";
import { toAuthUserDto } from "./userDto.js";

export const authService = {
  async register(body: unknown): Promise<RegisterPendingResponse> {
    const data = registerRequestSchema.parse(body);
    assertStrongPassword(data.password);

    const exists = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (exists) {
      throw Object.assign(new Error("EMAIL_TAKEN"), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName ?? null,
        role: data.role === "owner" ? "OWNER" : "TRAVELER",
      },
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

    try {
      return await emailVerificationService.createPendingRegistration(user);
    } catch (error) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      throw error;
    }
  },

  async login(body: unknown): Promise<AuthResponse> {
    const data = loginRequestSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw Object.assign(new Error("INVALID_CREDENTIALS"), { statusCode: 401 });
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("INVALID_CREDENTIALS"), { statusCode: 401 });
    }

    if (!user.emailVerifiedAt) {
      throw Object.assign(new Error("EMAIL_NOT_VERIFIED"), { statusCode: 403 });
    }

    return {
      accessToken: signAuthToken(user.id, user.email),
      user: toAuthUserDto(user),
    };
  },

  async forgotPassword(body: unknown): Promise<ForgotPasswordResponse> {
    const data = forgotPasswordRequestSchema.parse(body);
    await prisma.user.findUnique({ where: { email: data.email } });
    return forgotPasswordResponseSchema.parse({
      message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
    });
  },

  signToken(userId: number, email: string): string {
    return signAuthToken(userId, email);
  },
};
