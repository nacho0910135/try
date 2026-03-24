import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getManageProperty,
  getPropertyBySlug,
  getPropertySeoBySlug,
  recordPropertyBoostMetric,
  getZoneSeoData,
  listFeaturedProperties,
  listPropertySitemapEntries,
  listMyProperties,
  listProperties,
  updatePropertyFeatured,
  updateProperty,
  updatePropertyStatus
} from "../controllers/propertyController.js";
import { authorize, optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";
import { propertySearchLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createPropertySchema,
  propertyBoostMetricSchema,
  listPropertiesSchema,
  propertyFeaturedSchema,
  propertyIdSchema,
  propertySlugSchema,
  propertyStatusSchema,
  updatePropertySchema,
  zoneSeoSchema
} from "../validators/propertyValidators.js";

export const propertyRoutes = Router();

propertyRoutes.get("/", propertySearchLimiter, validate(listPropertiesSchema), listProperties);
propertyRoutes.get("/seo/zone", validate(zoneSeoSchema), getZoneSeoData);
propertyRoutes.get("/seo/sitemap", listPropertySitemapEntries);
propertyRoutes.get("/featured", listFeaturedProperties);
propertyRoutes.post("/:propertyId/boost-metrics", validate(propertyBoostMetricSchema), recordPropertyBoostMetric);
propertyRoutes.get("/my/listings", requireAuth, authorize("agent", "owner", "admin"), listMyProperties);
propertyRoutes.get("/slug/:slug/seo", optionalAuth, validate(propertySlugSchema), getPropertySeoBySlug);
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
propertyRoutes.patch(
  "/:propertyId/featured",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(propertyFeaturedSchema),
  updatePropertyFeatured
);
propertyRoutes.delete(
  "/:propertyId",
  requireAuth,
  authorize("agent", "owner", "admin"),
  validate(propertyIdSchema),
  deleteProperty
);
