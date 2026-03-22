import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const favoriteParamSchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  })
});

