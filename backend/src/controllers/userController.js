import { userService } from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await userService.getDashboardSummary(req.user);
  res.json({ success: true, summary });
});

export const getCommercialOverview = asyncHandler(async (req, res) => {
  const overview = await userService.getCommercialOverview(req.user);
  res.json({ success: true, overview });
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await userService.updateSubscription(req.user, req.body);
  res.json({ success: true, subscription });
});

export const requestVerification = asyncHandler(async (req, res) => {
  const user = await userService.requestVerification(req.user, req.body);
  res.json({ success: true, user });
});
