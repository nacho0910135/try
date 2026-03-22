import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES } from "../constants/enums.js";
import { emailSchema, objectIdSchema, phoneSchema } from "./common.js";

export const createLeadSchema = z.object({
  body: z.object({
    propertyId: objectIdSchema,
    name: z.string().min(2).max(120),
    email: emailSchema,
    phone: phoneSchema,
    message: z.string().min(10).max(2000),
    source: z.enum(LEAD_SOURCES).optional()
  })
});

export const updateLeadStatusSchema = z.object({
  params: z.object({
    leadId: objectIdSchema
  }),
  body: z.object({
    status: z.enum(LEAD_STATUSES)
  })
});

