import {
  authResponseSchema,
  forgotPasswordResponseSchema,
  forgotPasswordVerifyResponseSchema,
  registerPendingResponseSchema,
  resetPasswordResponseSchema,
  verifyEmailResponseSchema,
} from "@travel-app/shared/contracts/auth";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUserFixture, resetDatabase } from "./helpers/testDb.js";

const mailServiceMock = vi.hoisted(() => ({
  isConfigured: vi.fn(() => true),
  sendPasswordResetOtp: vi.fn().mockResolvedValue(undefined),
  sendEmailVerificationOtp: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/services/mail.service.js", () => ({
  mailService: mailServiceMock,
}));

const { default: app } = await import("../../src/app.js");
const { prisma } = await import("../../src/database/client.js");
const { resetRateLimitState } = await import("../../src/middleware/rateLimit.js");

describe("db auth flows", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.clearAllMocks();
    resetRateLimitState();
    mailServiceMock.isConfigured.mockReturnValue(true);
  });

  it("đăng ký tạo tài khoản chờ xác minh và chỉ cho đăng nhập sau khi OTP hợp lệ", async () => {
    const email = "traveler-db@example.com";
    const password = "secret123";

    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      fullName: "Khách du lịch DB",
    });

    expect(registerRes.status).toBe(201);
    const registerPayload = registerPendingResponseSchema.parse(registerRes.body.data);
    expect(registerPayload.email).toBe(email);

    const createdUser = await prisma.user.findUnique({ where: { email } });
    expect(createdUser?.emailVerifiedAt).toBeNull();
    expect(mailServiceMock.sendEmailVerificationOtp).toHaveBeenCalledTimes(1);

    const loginBeforeVerify = await request(app).post("/api/v1/auth/login").send({
      email,
      password,
    });

    expect(loginBeforeVerify.status).toBe(403);
    expect(loginBeforeVerify.body).toEqual({ ok: false, error: "EMAIL_NOT_VERIFIED" });

    const otp = mailServiceMock.sendEmailVerificationOtp.mock.calls.at(-1)?.[1];
    expect(otp).toMatch(/^\d{6}$/);

    const verifyRes = await request(app).post("/api/v1/auth/register/verify").send({
      email,
      otp,
    });

    expect(verifyRes.status).toBe(200);
    const verifyPayload = verifyEmailResponseSchema.parse(verifyRes.body.data);
    expect(verifyPayload.user.emailVerified).toBe(true);

    const loginAfterVerify = await request(app).post("/api/v1/auth/login").send({
      email,
      password,
    });

    expect(loginAfterVerify.status).toBe(200);
    const loginPayload = authResponseSchema.parse(loginAfterVerify.body.data);
    expect(loginPayload.user.emailVerified).toBe(true);
    expect(loginPayload.user.role).toBe("traveler");
  });

  it("quên mật khẩu chạy trọn vòng đời OTP và cho phép đăng nhập bằng mật khẩu mới", async () => {
    const user = await createUserFixture({
      email: "reset-db@example.com",
      password: "secret123",
      verified: true,
    });

    const forgotRes = await request(app).post("/api/v1/auth/forgot-password").send({
      email: user.email,
    });

    expect(forgotRes.status).toBe(200);
    forgotPasswordResponseSchema.parse(forgotRes.body.data);
    expect(mailServiceMock.sendPasswordResetOtp).toHaveBeenCalledTimes(1);

    const otp = mailServiceMock.sendPasswordResetOtp.mock.calls.at(-1)?.[1];
    expect(otp).toMatch(/^\d{6}$/);

    const verifyOtpRes = await request(app)
      .post("/api/v1/auth/forgot-password/verify")
      .send({
        email: user.email,
        otp,
      });

    expect(verifyOtpRes.status).toBe(200);
    forgotPasswordVerifyResponseSchema.parse(verifyOtpRes.body.data);

    const resetRes = await request(app).post("/api/v1/auth/reset-password").send({
      email: user.email,
      otp,
      newPassword: "newSecret123",
    });

    expect(resetRes.status).toBe(200);
    resetPasswordResponseSchema.parse(resetRes.body.data);

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "newSecret123",
    });

    expect(loginRes.status).toBe(200);
    authResponseSchema.parse(loginRes.body.data);
  });

  it("quên mật khẩu báo rõ khi tài khoản không tồn tại", async () => {
    const res = await request(app).post("/api/v1/auth/forgot-password").send({
      email: "missing@example.com",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "ACCOUNT_NOT_FOUND" });
  });

  it("gửi lại OTP xác minh quá sớm sẽ bị rate limit", async () => {
    const email = "resend-limit@example.com";

    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email,
      password: "secret123",
      fullName: "Người nhận OTP",
    });
    expect(registerRes.status).toBe(201);

    const resendRes = await request(app).post("/api/v1/auth/register/resend-otp").send({
      email,
    });

    expect(resendRes.status).toBe(429);
    expect(resendRes.body.ok).toBe(false);
    expect(resendRes.body.error).toBe("RATE_LIMITED");
    expect(resendRes.body.issues?.retryAfterSeconds).toBeGreaterThan(0);
  });
});
