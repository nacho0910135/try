import { adminService } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const data = await adminService.listUsers(req.query);
  res.json({ success: true, ...data });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.params.userId, req.body);
  res.json({ success: true, user });
});

export const listProperties = asyncHandler(async (req, res) => {
  const data = await adminService.listProperties(req.query);
  res.json({ success: true, ...data });
});

export const moderateProperty = asyncHandler(async (req, res) => {
  const property = await adminService.moderateProperty(req.params.propertyId, req.user, req.body);
  res.json({ success: true, property });
});

export const getMetrics = asyncHandler(async (_req, res) => {
  const metrics = await adminService.getMetrics();
  res.json({ success: true, metrics });
});

