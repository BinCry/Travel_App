import {
  authResponseSchema,
  forgotPasswordResponseSchema,
  forgotPasswordVerifyResponseSchema,
  registerPendingResponseSchema,
  resetPasswordResponseSchema,
  verifyEmailResponseSchema,
} from "@travel-app/shared/contracts/auth";
import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  passwordResetOtp: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  emailVerificationOtp: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
};

const mailServiceMock = {
  isConfigured: vi.fn(() => true),
  sendPasswordResetOtp: vi.fn().mockResolvedValue(undefined),
  sendEmailVerificationOtp: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../../src/database/client.js", () => ({
  prisma: prismaMock,
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../src/services/mail.service.js", () => ({
  mailService: mailServiceMock,
}));

const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");
const { default: app } = await import("../../src/app.js");

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitState();
    mailServiceMock.isConfigured.mockReturnValue(true);
  });

  it("registers a new traveler account and returns pending verification", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: 1,
      email: "traveler@example.com",
      emailVerifiedAt: null,
      fullName: "Traveler One",
      username: null,
      avatarUrl: null,
      location: null,
      role: "TRAVELER",
    });
    prismaMock.emailVerificationOtp.findFirst.mockResolvedValueOnce(null);
    prismaMock.emailVerificationOtp.create.mockResolvedValueOnce({
      id: "verify-otp-1",
      email: "traveler@example.com",
    });
    prismaMock.emailVerificationOtp.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "traveler@example.com",
      password: "secret123",
      fullName: "Traveler One",
    });

    expect(res.status).toBe(201);
    const payload = registerPendingResponseSchema.parse(res.body.data);
    expect(payload.email).toBe("traveler@example.com");
    expect(payload.message).toContain("OTP");
    expect(mailServiceMock.sendEmailVerificationOtp).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "traveler@example.com",
          role: "TRAVELER",
        }),
      })
    );
  });

  it("registers an owner account when the owner role is requested", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: 12,
      email: "lan.owner@example.com",
      emailVerifiedAt: null,
      fullName: "Lan Trần",
      username: null,
      avatarUrl: null,
      location: null,
      role: "OWNER",
    });
    prismaMock.emailVerificationOtp.findFirst.mockResolvedValueOnce(null);
    prismaMock.emailVerificationOtp.create.mockResolvedValueOnce({
      id: "verify-otp-owner-1",
      email: "lan.owner@example.com",
    });
    prismaMock.emailVerificationOtp.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "lan.owner@example.com",
      password: "secret123",
      fullName: "Lan Trần",
      role: "owner",
    });

    expect(res.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "lan.owner@example.com",
          role: "OWNER",
        }),
      })
    );
  });

  it("rejects duplicate registration", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 10 });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "traveler@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ ok: false, error: "EMAIL_TAKEN" });
  });

  it("returns validation errors for invalid register payloads", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "bad-email",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("VALIDATION");
  });

  it("verifies email successfully and signs the user in", async () => {
    const { createHash } = await import("node:crypto");
    const hashed = createHash("sha256").update("123456").digest("hex");
    prismaMock.emailVerificationOtp.findFirst.mockResolvedValueOnce({
      id: "verify-otp-1",
      email: "traveler@example.com",
      codeHash: hashed,
      attempts: 0,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "traveler@example.com",
      emailVerifiedAt: null,
      fullName: "Traveler One",
      username: null,
      avatarUrl: null,
      location: "Huế",
      role: "TRAVELER",
    });
    prismaMock.user.update.mockResolvedValueOnce({
      id: 1,
      email: "traveler@example.com",
      emailVerifiedAt: new Date(),
      fullName: "Traveler One",
      username: null,
      avatarUrl: null,
      location: "Huế",
      role: "TRAVELER",
    });
    prismaMock.emailVerificationOtp.update.mockResolvedValueOnce({});
    prismaMock.emailVerificationOtp.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app).post("/api/v1/auth/register/verify").send({
      email: "traveler@example.com",
      otp: "123456",
    });

    expect(res.status).toBe(200);
    const payload = verifyEmailResponseSchema.parse(res.body.data);
    expect(payload.user.emailVerified).toBe(true);
    expect(payload.message).toBe("Xác minh email thành công.");
  });

  it("resends verification OTP for unverified accounts", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "traveler@example.com",
      emailVerifiedAt: null,
    });
    prismaMock.emailVerificationOtp.findFirst.mockResolvedValueOnce(null);
    prismaMock.emailVerificationOtp.create.mockResolvedValueOnce({
      id: "verify-otp-2",
      email: "traveler@example.com",
    });
    prismaMock.emailVerificationOtp.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app).post("/api/v1/auth/register/resend-otp").send({
      email: "traveler@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Đã gửi lại mã xác minh email.");
    expect(mailServiceMock.sendEmailVerificationOtp).toHaveBeenCalledTimes(1);
  });

  it("logs in with valid verified credentials", async () => {
    const passwordHash = await bcrypt.hash("secret123", 4);
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 2,
      email: "lan.owner@example.com",
      passwordHash,
      emailVerifiedAt: new Date(),
      fullName: "Owner",
      username: "owner-two",
      avatarUrl: null,
      location: "Huế",
      role: "OWNER",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "lan.owner@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(200);
    const payload = authResponseSchema.parse(res.body.data);
    expect(payload.user.role).toBe("owner");
    expect(payload.user.location).toBe("Huế");
    expect(payload.user.emailVerified).toBe(true);
  });

  it("blocks login when email has not been verified", async () => {
    const passwordHash = await bcrypt.hash("secret123", 4);
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 3,
      email: "traveler@example.com",
      passwordHash,
      emailVerifiedAt: null,
      fullName: "Traveler",
      username: null,
      avatarUrl: null,
      location: null,
      role: "TRAVELER",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "traveler@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: "EMAIL_NOT_VERIFIED" });
  });

  it("rejects invalid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "missing@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "INVALID_CREDENTIALS" });
  });

  it("returns not found when forgot-password email does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).post("/api/v1/auth/forgot-password").send({
      email: "missing@example.com",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "ACCOUNT_NOT_FOUND" });
  });

  it("sends OTP when forgot-password email exists", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 3,
      email: "known@example.com",
    });
    prismaMock.passwordResetOtp.findFirst.mockResolvedValueOnce(null);
    prismaMock.passwordResetOtp.create.mockResolvedValueOnce({
      id: "otp-1",
      email: "known@example.com",
    });
    prismaMock.passwordResetOtp.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app).post("/api/v1/auth/forgot-password").send({
      email: "known@example.com",
    });

    expect(res.status).toBe(200);
    expect(mailServiceMock.sendPasswordResetOtp).toHaveBeenCalledTimes(1);
    const payload = forgotPasswordResponseSchema.parse(res.body.data);
    expect(payload.message).toBe("Đã gửi mã OTP.");
  });

  it("rate limits repeated OTP requests during cooldown", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 3,
      email: "known@example.com",
    });
    prismaMock.passwordResetOtp.findFirst.mockResolvedValueOnce({
      id: "otp-1",
      email: "known@example.com",
      createdAt: new Date(),
      consumedAt: null,
    });

    const res = await request(app).post("/api/v1/auth/forgot-password").send({
      email: "known@example.com",
    });

    expect(res.status).toBe(429);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("RATE_LIMITED");
    expect(res.body.issues.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("verifies forgot-password OTP successfully", async () => {
    prismaMock.passwordResetOtp.update.mockResolvedValueOnce({});

    const { createHash } = await import("node:crypto");
    const hashed = createHash("sha256").update("123456").digest("hex");
    prismaMock.passwordResetOtp.findFirst.mockResolvedValueOnce({
      id: "otp-1",
      email: "known@example.com",
      codeHash: hashed,
      attempts: 0,
      verifiedAt: null,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await request(app).post("/api/v1/auth/forgot-password/verify").send({
      email: "known@example.com",
      otp: "123456",
    });

    expect(res.status).toBe(200);
    const payload = forgotPasswordVerifyResponseSchema.parse(res.body.data);
    expect(payload.message).toBe("Xác thực OTP thành công.");
  });

  it("resets password after OTP verification", async () => {
    const { createHash } = await import("node:crypto");
    const hashed = createHash("sha256").update("123456").digest("hex");
    prismaMock.passwordResetOtp.findFirst.mockResolvedValueOnce({
      id: "otp-1",
      email: "known@example.com",
      codeHash: hashed,
      attempts: 0,
      verifiedAt: new Date(),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 3,
      email: "known@example.com",
    });
    prismaMock.user.update.mockResolvedValueOnce({});
    prismaMock.passwordResetOtp.update.mockResolvedValueOnce({});

    const res = await request(app).post("/api/v1/auth/reset-password").send({
      email: "known@example.com",
      otp: "123456",
      newPassword: "new-secret123",
    });

    expect(res.status).toBe(200);
    const payload = resetPasswordResponseSchema.parse(res.body.data);
    expect(payload.message).toBe("Đặt lại mật khẩu thành công.");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });
});
