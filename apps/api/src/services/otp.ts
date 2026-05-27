import { createHash, randomInt } from "node:crypto";

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_MS = 60_000;
export const OTP_MAX_ATTEMPTS = 5;

export function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
