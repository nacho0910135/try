import { Router } from "express";
import {
  askInteractiveAssistant,
  compareInteractiveProperties,
  getInteractiveOverview
} from "../controllers/interactiveAnalysisController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { analysisInteractionLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  analysisChatSchema,
  comparePropertiesSchema
} from "../validators/analysisValidators.js";

export const analysisRoutes = Router();

analysisRoutes.get("/overview", getInteractiveOverview);
analysisRoutes.post(
  "/compare",
  analysisInteractionLimiter,
  requireAuth,
  validate(comparePropertiesSchema),
  compareInteractiveProperties
);
analysisRoutes.post(
  "/chat",
  analysisInteractionLimiter,
  requireAuth,
  validate(analysisChatSchema),
  askInteractiveAssistant
);
