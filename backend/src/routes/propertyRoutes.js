import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getManageProperty,
  getPropertyBySlug,
  listFeaturedProperties,
  listMyProperties,
  listProperties,
  updateProperty,
  updatePropertyStatus
} from "../controllers/propertyController.js";
import { authorize, optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createPropertySchema,
  listPropertiesSchema,
  propertyIdSchema,
  propertySlugSchema,
  propertyStatusSchema,
  updatePropertySchema
} from "../validators/propertyValidators.js";

export const propertyRoutes = Router();

propertyRoutes.get("/", validate(listPropertiesSchema), listProperties);
propertyRoutes.get("/featured", listFeaturedProperties);
propertyRoutes.get("/my/listings", requireAuth, authorize("agent", "owner", "admin"), listMyProperties);
propertyRoutes.get("/slug/:slug", optionalAuth, validate(propertySlugSchema), getPropertyBySlug);
propertyRoutes.get(
  "/manage/:propertyId",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(propertyIdSchema),
  getManageProperty
);
propertyRoutes.post(
  "/",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(createPropertySchema),
  createProperty
);
propertyRoutes.patch(
  "/:propertyId",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(updatePropertySchema),
  updateProperty
);
propertyRoutes.patch(
  "/:propertyId/status",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(propertyStatusSchema),
  updatePropertyStatus
);
propertyRoutes.delete(
  "/:propertyId",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(propertyIdSchema),
  deleteProperty
);

