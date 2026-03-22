import { Router } from "express";
import {
  getMetrics,
  listProperties,
  listUsers,
  moderateProperty,
  updateUserStatus,
  updateUserVerification
} from "../controllers/adminController.js";
import { authorize, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  analyticsPropertySchema,
  listAdminPropertiesSchema,
  listAdminUsersSchema,
  moderatePropertySchema,
  updateUserVerificationSchema,
  updateUserStatusSchema
} from "../validators/adminValidators.js";
import {
  getMarketOverview,
  getPropertyIntelligence
} from "../controllers/marketAnalyticsController.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, authorize("admin"));
adminRoutes.get("/metrics", getMetrics);
adminRoutes.get("/analytics/overview", getMarketOverview);
adminRoutes.get(
  "/analytics/properties/:propertyId",
  validate(analyticsPropertySchema),
  getPropertyIntelligence
);
adminRoutes.get("/users", validate(listAdminUsersSchema), listUsers);
adminRoutes.patch("/users/:userId/status", validate(updateUserStatusSchema), updateUserStatus);
adminRoutes.patch(
  "/users/:userId/verification",
  validate(updateUserVerificationSchema),
  updateUserVerification
);
adminRoutes.get("/properties", validate(listAdminPropertiesSchema), listProperties);
adminRoutes.patch("/properties/:propertyId", validate(moderatePropertySchema), moderateProperty);
