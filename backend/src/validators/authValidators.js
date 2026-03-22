import { z } from "zod";
import { emailSchema, passwordSchema, phoneSchema } from "./common.js";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    role: z.enum(["user", "agent", "owner"]).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1)
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: passwordSchema
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    phone: phoneSchema,
    avatar: z.string().url().optional().or(z.literal("")),
    password: passwordSchema.optional()
  })
});
