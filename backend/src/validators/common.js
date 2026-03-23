import { z } from "zod";

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  return value;
};

const parseJson = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
};

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(128);
export const phoneSchema = z.string().min(7).max(30).optional().or(z.literal(""));
export const urlLikeSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return false;
    }

    if (value.startsWith("/") || value.startsWith("data:")) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch (_error) {
      return false;
    }
  }, "Invalid url");
export const numberField = () => z.preprocess(parseNumber, z.number().nonnegative().optional());
export const integerField = () => z.preprocess(parseNumber, z.number().int().nonnegative().optional());
export const booleanField = () => z.preprocess(parseBoolean, z.boolean().optional());
export const jsonField = () => z.preprocess(parseJson, z.any().optional());
