import dotenv from "dotenv";

dotenv.config();

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  appName: process.env.APP_NAME || "Travel App",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 8000,
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  databaseUrl: process.env.DATABASE_URL || "",
  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 0,
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFrom: process.env.SMTP_FROM || "",
  publicBaseUrl:
    (process.env.PUBLIC_BASE_URL || `http://localhost:${Number(process.env.PORT) || 8000}`)
      .replace(/\/$/, ""),
  uploadsDir: process.env.UPLOADS_DIR || "uploads",
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  trustProxy:
    process.env.TRUST_PROXY === "1" ||
    process.env.TRUST_PROXY === "true" ||
    process.env.TRUST_PROXY === "yes",
};
