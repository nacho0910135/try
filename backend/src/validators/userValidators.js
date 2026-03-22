import { z } from "zod";
import { SUBSCRIPTION_PLAN_NAMES, VERIFICATION_TYPES } from "../constants/enums.js";

export const verificationRequestSchema = z.object({
  body: z.object({
    requestedType: z.enum(VERIFICATION_TYPES),
    requestNote: z.string().max(500).optional().default("")
  })
});

export const subscriptionUpdateSchema = z.object({
  body: z.object({
    plan: z.enum(SUBSCRIPTION_PLAN_NAMES),
    billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly")
  })
});
