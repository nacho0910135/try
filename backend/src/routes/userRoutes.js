import { Router } from "express";
import {
  getCommercialOverview,
  getDashboardSummary,
  getManagementEmails,
  getManagementOverview,
  updateManagementSettings,
  updateSubscription,
  requestVerification
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  managementSettingsSchema,
  subscriptionUpdateSchema,
  verificationRequestSchema
} from "../validators/userValidators.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get("/dashboard-summary", getDashboardSummary);
userRoutes.get("/commercial-overview", getCommercialOverview);
userRoutes.get("/management-overview", getManagementOverview);
userRoutes.get("/management-emails", getManagementEmails);
userRoutes.patch("/management-settings", validate(managementSettingsSchema), updateManagementSettings);
userRoutes.patch("/subscription", validate(subscriptionUpdateSchema), updateSubscription);
userRoutes.post("/verification-request", validate(verificationRequestSchema), requestVerification);
