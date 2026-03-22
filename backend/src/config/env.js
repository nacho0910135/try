import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const emptyToUndefined = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true" || value === "1";
};

const envSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/casa-cr"),
  JWT_SECRET: z.string().min(8).default("change-this-super-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z.preprocess(parseBoolean, z.boolean().default(false)),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  MONITORING_WEBHOOK_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  CLOUDINARY_CLOUD_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_API_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  DEEPSEEK_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  DEEPSEEK_BASE_URL: z.string().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PORT: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  SMTP_SECURE: z.preprocess(parseBoolean, z.boolean().optional()),
  SMTP_USER: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
  ALERTS_AUTORUN: z.preprocess(parseBoolean, z.boolean().default(true)),
  ALERTS_INTERVAL_MINUTES: z.coerce.number().int().positive().default(60),
  BACKUP_DIR: z.string().default("backups/mongo"),
  BACKUP_RETENTION_DAYS: z.coerce.number().int().positive().default(7),
  STRIPE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().optional())
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (
  parsed.data.NODE_ENV === "production" &&
  (parsed.data.JWT_SECRET === "change-this-super-secret" || parsed.data.JWT_SECRET.length < 32)
) {
  console.error("Invalid environment variables", {
    JWT_SECRET: ["JWT_SECRET must be changed before running in production and be at least 32 characters"]
  });
  process.exit(1);
}

if (
  parsed.data.NODE_ENV !== "production" &&
  (parsed.data.JWT_SECRET === "change-this-super-secret" || parsed.data.JWT_SECRET.length < 24)
) {
  console.warn(
    "[security] JWT_SECRET is using a weak development value. Rotate it before sharing this environment."
  );
}

export const env = parsed.data;
