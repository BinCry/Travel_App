import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { OTP_EXPIRY_MINUTES } from "./otp.js";

function getTransportConfig() {
  if (
    !env.smtpHost ||
    !env.smtpPort ||
    !env.smtpUser ||
    !env.smtpPassword ||
    !env.smtpFrom
  ) {
    throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
  }

  return {
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  };
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport(getTransportConfig());
  }
  return cachedTransporter;
}

function buildOtpMail(params: {
  otp: string;
  title: string;
  intro: string;
  actionLabel: string;
  subject: string;
  warning: string;
}) {
  const { otp, title, intro, actionLabel, subject, warning } = params;
  const appName = env.appName;

  const text = [
    "Xin chào,",
    "",
    intro,
    "",
    `${actionLabel}: ${otp}`,
    "",
    `Mã xác thực này có hiệu lực trong ${OTP_EXPIRY_MINUTES} phút kể từ thời điểm email được gửi.`,
    warning,
    "",
    `Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email. Đội ngũ ${appName} sẽ không bao giờ yêu cầu bạn cung cấp mã OTP qua cuộc gọi, tin nhắn hoặc mạng xã hội.`,
    "",
    `Trân trọng,`,
    `Đội ngũ ${appName}`,
  ].join("\n");

  const html = `
    <div style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#00b4d8,#0077b6);color:#ffffff;">
          <div style="font-size:24px;font-weight:700;letter-spacing:0.2px;">${appName}</div>
          <div style="margin-top:8px;font-size:14px;line-height:1.6;opacity:0.95;">
            ${title}
          </div>
        </div>

        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Xin chào,</p>

          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
            ${intro}
          </p>

          <div style="margin:24px 0;padding:20px;border-radius:14px;background:#f8fbff;border:1px solid #d7eef8;text-align:center;">
            <div style="font-size:13px;letter-spacing:1.2px;text-transform:uppercase;color:#64748b;margin-bottom:10px;">
              ${actionLabel}
            </div>
            <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#0f172a;">
              ${otp}
            </div>
          </div>

          <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">
            Mã xác thực này sẽ hết hạn sau <strong>${OTP_EXPIRY_MINUTES} phút</strong>.
          </p>

          <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">
            ${warning}
          </p>

          <div style="margin-top:24px;padding:16px 18px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:14px;line-height:1.6;">
            Lưu ý bảo mật: Đội ngũ ${appName} sẽ không bao giờ yêu cầu bạn cung cấp OTP qua cuộc gọi, tin nhắn hoặc mạng xã hội.
          </div>

          <p style="margin:24px 0 0;font-size:15px;line-height:1.7;">
            Trân trọng,<br />
            <strong>Đội ngũ ${appName}</strong>
          </p>
        </div>
      </div>
    </div>
  `.trim();

  return {
    subject: `[${appName}] ${subject}`,
    text,
    html,
  };
}

export const mailService = {
  isConfigured() {
    return Boolean(
      env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPassword && env.smtpFrom
    );
  },

  async sendPasswordResetOtp(email: string, otp: string) {
    if (!this.isConfigured()) {
      throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
    }

    const content = buildOtpMail({
      otp,
      title: "Xác minh yêu cầu đặt lại mật khẩu",
      intro:
        `Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản ${env.appName} của bạn. ` +
        "Vui lòng dùng mã OTP bên dưới để xác minh và tiếp tục cập nhật mật khẩu mới.",
      actionLabel: "Mã OTP đặt lại mật khẩu",
      subject: "Mã OTP đặt lại mật khẩu của bạn",
      warning:
        "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không thay đổi cho đến khi quá trình xác minh hoàn tất.",
    });

    try {
      await getTransporter().sendMail({
        from: env.smtpFrom,
        to: email,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
    } catch {
      throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
    }
  },

  async sendEmailVerificationOtp(email: string, otp: string) {
    if (!this.isConfigured()) {
      throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
    }

    const content = buildOtpMail({
      otp,
      title: "Xác minh địa chỉ email để kích hoạt tài khoản",
      intro:
        `Tài khoản ${env.appName} của bạn đã được tạo thành công. ` +
        "Vui lòng nhập mã OTP bên dưới để xác minh email và bắt đầu sử dụng đầy đủ các tính năng trong ứng dụng.",
      actionLabel: "Mã OTP xác minh email",
      subject: "Mã OTP xác minh email của bạn",
      warning:
        "Nếu bạn không thực hiện đăng ký tài khoản, hãy bỏ qua email này. Tài khoản chưa xác minh sẽ không thể đăng nhập và sử dụng ứng dụng.",
    });

    try {
      await getTransporter().sendMail({
        from: env.smtpFrom,
        to: email,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
    } catch {
      throw Object.assign(new Error("EMAIL_DELIVERY_FAILED"), { statusCode: 503 });
    }
  },
};
