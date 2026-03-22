import { asyncHandler } from "../utils/asyncHandler.js";
import { interactiveAnalysisService } from "../services/interactiveAnalysisService.js";

export const getInteractiveOverview = asyncHandler(async (_req, res) => {
  const analytics = await interactiveAnalysisService.getOverview();
  res.json({ success: true, analytics });
});

export const compareInteractiveProperties = asyncHandler(async (req, res) => {
  const comparison = await interactiveAnalysisService.compareProperties(req.body.propertyIds, {
    language: req.body.language || "es"
  });

  res.json({ success: true, comparison });
});

export const askInteractiveAssistant = asyncHandler(async (req, res) => {
  const response = await interactiveAnalysisService.askAssistant({
    question: req.body.question,
    propertyIds: req.body.propertyIds || [],
    language: req.body.language || "es",
    history: req.body.history || []
  });

  res.json({ success: true, response });
});
