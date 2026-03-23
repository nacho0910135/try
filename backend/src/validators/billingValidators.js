import { z } from "zod";
import { SUBSCRIPTION_PLAN_NAMES } from "../constants/enums.js";
import { objectIdSchema } from "./common.js";

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

export const checkoutSessionSchema = z.object({
  body: z.object({
    plan: z.enum(SUBSCRIPTION_PLAN_NAMES),
    billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly")
  })
});

export const paypalBoostOrderSchema = z.object({
  body: z.object({
    propertyId: objectIdSchema
  })
});

export const paypalDonationOrderSchema = z.object({
  body: z.object({
    amount: z.preprocess(parseNumber, z.number().positive().max(10000)),
    donorName: z.string().trim().max(120).optional(),
    note: z.string().trim().max(240).optional()
  })
});

export const capturePaypalOrderSchema = z.object({
  body: z.object({
    orderId: z.string().trim().min(8).max(64)
  })
});
