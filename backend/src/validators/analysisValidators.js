import { z } from "zod";
import { objectIdSchema } from "./common.js";

const languageSchema = z.enum(["es", "en"]).optional();

const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(1400)
});

export const comparePropertiesSchema = z.object({
  body: z.object({
    propertyIds: z.array(objectIdSchema).length(2),
    language: languageSchema
  })
});

export const analysisChatSchema = z.object({
  body: z.object({
    question: z.string().min(4).max(900),
    propertyIds: z.array(objectIdSchema).max(2).optional(),
    language: languageSchema,
    history: z.array(chatHistoryItemSchema).max(8).optional()
  })
});
