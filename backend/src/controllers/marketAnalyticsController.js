import { marketAnalyticsService } from "../services/marketAnalyticsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMarketOverview = asyncHandler(async (_req, res) => {
  const analytics = await marketAnalyticsService.getOverview();
  res.json({ success: true, analytics });
});

export const getPropertyIntelligence = asyncHandler(async (req, res) => {
  const intelligence = await marketAnalyticsService.getPropertyIntelligence(
    req.params.propertyId
  );
  res.json({ success: true, intelligence });
});

