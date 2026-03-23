import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const backendEnvPath = path.join(rootDir, "backend", ".env");
const frontendEnvPath = path.join(rootDir, "frontend", ".env.local");

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
};

const isPlaceholder = (value = "") =>
  !value ||
  /change-this|changeme|example\.com|localhost|127\.0\.0\.1|your-key|your-domain/i.test(value);

const isValidAbsoluteUrl = (value = "") => {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
};

const backendEnv = parseEnvFile(backendEnvPath);
const frontendEnv = parseEnvFile(frontendEnvPath);
const errors = [];
const warnings = [];

const frontendUrls = String(backendEnv.FRONTEND_URL || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (!fs.existsSync(backendEnvPath)) {
  errors.push("Falta backend/.env");
}

if (!fs.existsSync(frontendEnvPath)) {
  errors.push("Falta frontend/.env.local");
}

if ((backendEnv.NODE_ENV || "").toLowerCase() !== "production") {
  warnings.push("NODE_ENV no esta en production");
}

if (!backendEnv.JWT_SECRET || backendEnv.JWT_SECRET.length < 32 || isPlaceholder(backendEnv.JWT_SECRET)) {
  errors.push("JWT_SECRET es debil o sigue con valor de desarrollo");
}

if (!backendEnv.MONGODB_URI || isPlaceholder(backendEnv.MONGODB_URI)) {
  warnings.push("MONGODB_URI parece seguir apuntando a desarrollo");
}

if (!frontendUrls.length || frontendUrls.some((url) => !isValidAbsoluteUrl(url))) {
  errors.push("FRONTEND_URL debe contener una o mas URLs absolutas validas");
}

if (!backendEnv.EMAIL_FROM || !/\S+@\S+\.\S+/.test(backendEnv.EMAIL_FROM)) {
  warnings.push("EMAIL_FROM no esta configurado o no contiene un correo usable");
}

const smtpFields = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const configuredSmtpFields = smtpFields.filter((key) => backendEnv[key]);
if (configuredSmtpFields.length > 0 && configuredSmtpFields.length < smtpFields.length) {
  errors.push("SMTP esta parcialmente configurado; completa host, port, user y pass");
}

const cloudinaryFields = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const configuredCloudinaryFields = cloudinaryFields.filter((key) => backendEnv[key]);
if (configuredCloudinaryFields.length > 0 && configuredCloudinaryFields.length < cloudinaryFields.length) {
  errors.push("Cloudinary esta parcialmente configurado; completa cloud name, api key y api secret");
}

if (!frontendEnv.NEXT_PUBLIC_SITE_URL || !isValidAbsoluteUrl(frontendEnv.NEXT_PUBLIC_SITE_URL) || isPlaceholder(frontendEnv.NEXT_PUBLIC_SITE_URL)) {
  errors.push("NEXT_PUBLIC_SITE_URL debe ser una URL publica real");
}

if (!frontendEnv.NEXT_PUBLIC_MAPBOX_TOKEN || frontendEnv.NEXT_PUBLIC_MAPBOX_TOKEN.length < 20) {
  errors.push("NEXT_PUBLIC_MAPBOX_TOKEN no esta configurado");
}

if (frontendEnv.NEXT_PUBLIC_API_URL && /localhost|127\.0\.0\.1/.test(frontendEnv.NEXT_PUBLIC_API_URL) && (backendEnv.NODE_ENV || "").toLowerCase() === "production") {
  warnings.push("NEXT_PUBLIC_API_URL sigue apuntando a localhost; en produccion deberias usar el dominio real o proxy");
}

if (!backendEnv.MONITORING_WEBHOOK_URL) {
  warnings.push("MONITORING_WEBHOOK_URL no esta configurado");
}

if (!backendEnv.SMTP_HOST) {
  warnings.push("SMTP no esta configurado; reset password y alertas por email no enviaran correos reales");
}

if (!backendEnv.CLOUDINARY_CLOUD_NAME) {
  warnings.push("Cloudinary no esta configurado; los uploads quedaran locales en el backend");
}

const output = [];
output.push("Chequeo de lanzamiento de BienesRaicesCR");
output.push("");

if (errors.length) {
  output.push("Errores:");
  for (const error of errors) {
    output.push(`- ${error}`);
  }
  output.push("");
}

if (warnings.length) {
  output.push("Advertencias:");
  for (const warning of warnings) {
    output.push(`- ${warning}`);
  }
  output.push("");
}

if (!errors.length && !warnings.length) {
  output.push("Configuracion lista para lanzamiento.");
}

console.log(output.join("\n"));

if (errors.length) {
  process.exitCode = 1;
}
