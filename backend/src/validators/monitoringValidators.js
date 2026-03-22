import { z } from "zod";

export const frontendErrorSchema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(12000).optional(),
  digest: z.string().max(200).optional(),
  path: z.string().max(500).optional(),
  source: z.string().max(100).optional(),
  componentStack: z.string().max(8000).optional(),
  userAgent: z.string().max(1200).optional(),
  language: z.string().max(50).optional()
});
