import { Router } from "express";
import {
  createSavedSearch,
  deleteSavedSearch,
  listSavedSearches,
  sendSavedSearchAlert,
  updateSavedSearch
} from "../controllers/savedSearchController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { savedSearchWriteLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createSavedSearchSchema,
  savedSearchIdSchema,
  updateSavedSearchSchema
} from "../validators/savedSearchValidators.js";

export const savedSearchRoutes = Router();

savedSearchRoutes.use(requireAuth);
savedSearchRoutes.get("/", listSavedSearches);
savedSearchRoutes.post("/", savedSearchWriteLimiter, validate(createSavedSearchSchema), createSavedSearch);
savedSearchRoutes.patch("/:searchId", savedSearchWriteLimiter, validate(updateSavedSearchSchema), updateSavedSearch);
savedSearchRoutes.post("/:searchId/send-alert", savedSearchWriteLimiter, validate(savedSearchIdSchema), sendSavedSearchAlert);
savedSearchRoutes.delete("/:searchId", savedSearchWriteLimiter, validate(savedSearchIdSchema), deleteSavedSearch);
