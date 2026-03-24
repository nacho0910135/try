import { z } from "zod";
import { jsonField, objectIdSchema } from "./common.js";

const boundsSchema = z
  .object({
    west: z.number(),
    south: z.number(),
    east: z.number(),
    north: z.number()
  })
  .optional();

export const createSavedSearchSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    filters: z.record(z.any()).default({}),
    mapArea: z
      .object({
        type: z.literal("Polygon"),
        coordinates: z.array(z.array(z.array(z.number())))
      })
      .optional(),
    bounds: boundsSchema,
    alertsEnabled: z.boolean().optional(),
    emailNotifications: z.boolean().optional()
  })
});

export const updateSavedSearchSchema = z.object({
  params: z.object({
    searchId: objectIdSchema
  }),
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    filters: z.record(z.any()).optional(),
    mapArea: jsonField(),
    bounds: boundsSchema,
    alertsEnabled: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    lastViewedAt: z.coerce.date().nullable().optional()
  })
});

export const savedSearchIdSchema = z.object({
  params: z.object({
    searchId: objectIdSchema
  })
});
