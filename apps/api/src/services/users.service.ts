import type { Prisma, UserRole } from "@prisma/client";
import type { ApiUser } from "@travel-app/shared/contracts/auth";
import bcrypt from "bcryptjs";
import {
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  deleteAccountRequestSchema,
  deleteAccountResponseSchema,
  updateMeRequestSchema,
  type ChangePasswordResponse,
  type DeleteAccountResponse,
} from "@travel-app/shared/contracts/users";
import { prisma } from "../database/client.js";
import { assertStrongPassword } from "./password-policy.js";
import { toAuthUserDto } from "./userDto.js";

function getDeleteAccountMessage(role: UserRole) {
  if (role === "OWNER") {
    return "Tài khoản và toàn bộ địa điểm, ưu đãi liên quan đã được xóa vĩnh viễn.";
  }
  return "Tài khoản đã được xóa vĩnh viễn.";
}

export const usersService = {
  async me(userId: number): Promise<ApiUser> {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        fullName: true,
        username: true,
        location: true,
        avatarUrl: true,
        role: true,
      },
    });
    if (!u) throw Object.assign(new Error("NOT_FOUND"), { statusCode: 404 });
    return toAuthUserDto(u);
  },

  async updateMe(userId: number, body: unknown): Promise<ApiUser> {
    const data = updateMeRequestSchema.parse(body);
    const update: Record<string, string | null> = {};
    if (data.fullName !== undefined) update.fullName = data.fullName;
    if (data.username !== undefined) update.username = data.username || null;
    if (data.location !== undefined) update.location = data.location || null;
    if (data.avatarUrl !== undefined) {
      update.avatarUrl = data.avatarUrl === "" ? null : data.avatarUrl;
    }

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: update,
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
          fullName: true,
          username: true,
          location: true,
          avatarUrl: true,
          role: true,
        },
      });
      return toAuthUserDto(updated);
    } catch (e: unknown) {
      const duplicateUsername =
        typeof e === "object" &&
        e &&
        "code" in e &&
        (e as { code: string }).code === "P2002";
      if (duplicateUsername) {
        throw Object.assign(new Error("USERNAME_TAKEN"), { statusCode: 409 });
      }
      throw e;
    }
  },

  async changePassword(userId: number, body: unknown): Promise<ChangePasswordResponse> {
    const data = changePasswordRequestSchema.parse(body);
    assertStrongPassword(data.newPassword);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw Object.assign(new Error("NOT_FOUND"), { statusCode: 404 });

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) throw Object.assign(new Error("INVALID_CREDENTIALS"), { statusCode: 401 });

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return changePasswordResponseSchema.parse({
      message: "Đổi mật khẩu thành công.",
    });
  },

  async deleteAccount(userId: number, body: unknown): Promise<DeleteAccountResponse> {
    const data = deleteAccountRequestSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });
    if (!user) {
      throw Object.assign(new Error("NOT_FOUND"), { statusCode: 404 });
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error("INVALID_CREDENTIALS"), { statusCode: 401 });
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [];
    if (user.role === "OWNER") {
      operations.push(
        prisma.place.deleteMany({
          where: { ownerId: userId },
        })
      );
    }
    operations.push(
      prisma.passwordResetOtp.deleteMany({
        where: {
          OR: [{ userId }, { email: user.email }],
        },
      })
    );
    operations.push(
      prisma.emailVerificationOtp.deleteMany({
        where: {
          OR: [{ userId }, { email: user.email }],
        },
      })
    );
    operations.push(
      prisma.user.delete({
        where: { id: userId },
      })
    );

    await prisma.$transaction(operations);

    return deleteAccountResponseSchema.parse({
      message: getDeleteAccountMessage(user.role),
    });
  },
};
