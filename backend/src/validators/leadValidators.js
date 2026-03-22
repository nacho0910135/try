import { z } from "zod";
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../constants/enums.js";
import { emailSchema, objectIdSchema, phoneSchema } from "./common.js";

const leadCrmPayloadSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    priority: z.enum(LEAD_PRIORITIES).optional(),
    internalNote: z.string().max(2000).optional(),
    nextFollowUpAt: z.coerce.date().nullable().optional(),
    lastContactedAt: z.coerce.date().nullable().optional()
  })
  .superRefine((value, context) => {
    if (
      value.status === undefined &&
      value.priority === undefined &&
      value.internalNote === undefined &&
      value.nextFollowUpAt === undefined &&
      value.lastContactedAt === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one CRM field is required"
      });
    }
  });

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

export const updateLeadSchema = z.object({
  params: z.object({
    leadId: objectIdSchema
  }),
  body: leadCrmPayloadSchema
});
