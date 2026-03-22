import { z } from "zod";
import { CURRENCIES, OFFER_SOURCES, OFFER_STATUSES } from "../constants/enums.js";
import { emailSchema, objectIdSchema, phoneSchema } from "./common.js";

export const createOfferSchema = z.object({
  body: z.object({
    propertyId: objectIdSchema,
    name: z.string().min(2).max(120),
    email: emailSchema,
    phone: phoneSchema,
    amount: z.number().positive(),
    currency: z.enum(CURRENCIES).optional(),
    message: z.string().min(4).max(2000).optional().default(""),
    source: z.enum(OFFER_SOURCES).optional()
  })
});

export const updateOfferStatusSchema = z.object({
  params: z.object({
    offerId: objectIdSchema
  }),
  body: z.object({
    status: z.enum(OFFER_STATUSES)
  })
});
