import { userService } from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { hasManagementAccess } from "../utils/managementAccess.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await userService.getDashboardSummary(req.user);
  res.json({ success: true, summary });
});

export const getCommercialOverview = asyncHandler(async (req, res) => {
  const overview = await userService.getCommercialOverview(req.user);
  res.json({ success: true, overview });
});

export const getManagementOverview = asyncHandler(async (req, res) => {
  if (!hasManagementAccess(req.user)) {
    throw new ApiError(403, "You do not have access to this resource");
  }

  const overview = await userService.getManagementOverview(req.user);
  res.json({ success: true, overview });
});

export const getManagementEmails = asyncHandler(async (req, res) => {
  if (!hasManagementAccess(req.user)) {
    throw new ApiError(403, "You do not have access to this resource");
  }

  const emails = await userService.getManagementEmails();
  res.json({ success: true, emails });
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await userService.updateSubscription(req.user, req.body);
  res.json({ success: true, subscription });
});

export const requestVerification = asyncHandler(async (req, res) => {
  const user = await userService.requestVerification(req.user, req.body);
  res.json({ success: true, user });
});
