import { z } from "zod";
import { SUBSCRIPTION_PLAN_NAMES } from "../constants/enums.js";

export const checkoutSessionSchema = z.object({
  body: z.object({
    plan: z.enum(SUBSCRIPTION_PLAN_NAMES),
    billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly")
  })
});
