import { userService } from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await userService.getDashboardSummary(req.user);
  res.json({ success: true, summary });
});

