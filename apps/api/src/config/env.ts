import dotenv from "dotenv";

dotenv.config();

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAzurePostgresConnection(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "postgresql:" && url.hostname.endsWith(".postgres.database.azure.com");
  } catch {
    return false;
  }
}

function hasRequiredSslMode(value: string): boolean {
  try {
    const url = new URL(value);
    return url.searchParams.get("sslmode") === "require";
  } catch {
    return false;
  }
}

function validateProductionEnv(config: {
  nodeEnv: string;
  databaseUrl: string;
  directUrl: string;
  publicBaseUrl: string;
}) {
  if (config.nodeEnv !== "production") {
    return;
  }

  if (!config.databaseUrl || !config.directUrl) {
    throw new Error("Môi trường production bắt buộc phải có DATABASE_URL và DIRECT_URL.");
  }

  if (!isAzurePostgresConnection(config.databaseUrl) || !isAzurePostgresConnection(config.directUrl)) {
    throw new Error(
      "Môi trường production phải dùng Azure Database for PostgreSQL với hostname dạng *.postgres.database.azure.com.",
    );
  }

  if (!hasRequiredSslMode(config.databaseUrl) || !hasRequiredSslMode(config.directUrl)) {
    throw new Error("Connection string PostgreSQL production phải có sslmode=require.");
  }

  if (!config.publicBaseUrl.startsWith("https://")) {
    throw new Error("PUBLIC_BASE_URL của production phải là HTTPS.");
  }
}

const loadedEnv = {
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

validateProductionEnv(loadedEnv);

export const env = loadedEnv;
