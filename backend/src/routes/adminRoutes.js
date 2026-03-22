import { Router } from "express";
import {
  getMetrics,
  listProperties,
  listUsers,
  moderateProperty,
  updateUserStatus
} from "../controllers/adminController.js";
import { authorize, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  listAdminPropertiesSchema,
  listAdminUsersSchema,
  moderatePropertySchema,
  updateUserStatusSchema
} from "../validators/adminValidators.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, authorize("admin"));
adminRoutes.get("/metrics", getMetrics);
adminRoutes.get("/users", validate(listAdminUsersSchema), listUsers);
adminRoutes.patch("/users/:userId/status", validate(updateUserStatusSchema), updateUserStatus);
adminRoutes.get("/properties", validate(listAdminPropertiesSchema), listProperties);
adminRoutes.patch("/properties/:propertyId", validate(moderatePropertySchema), moderateProperty);

