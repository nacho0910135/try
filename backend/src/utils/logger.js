import { env } from "../config/env.js";

const levelOrder = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const normalizeValue = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const serializeMeta = (meta = {}) => {
  try {
    return JSON.parse(
      JSON.stringify(meta, (_key, value) => normalizeValue(value))
    );
  } catch (_error) {
    return {
      unsafeMeta: true
    };
  }
};

const shouldLog = (level) => levelOrder[level] <= levelOrder[env.LOG_LEVEL];

const write = (level, message, meta = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: "BienesRaicesCR-api",
    message,
    ...serializeMeta(meta)
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  error(message, meta) {
    write("error", message, meta);
  },
  warn(message, meta) {
    write("warn", message, meta);
  },
  info(message, meta) {
    write("info", message, meta);
  },
  debug(message, meta) {
    write("debug", message, meta);
  }
};
