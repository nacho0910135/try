import { Router } from "express";
import {
  createSavedSearch,
  deleteSavedSearch,
  listSavedSearches,
  updateSavedSearch
} from "../controllers/savedSearchController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createSavedSearchSchema,
  savedSearchIdSchema,
  updateSavedSearchSchema
} from "../validators/savedSearchValidators.js";

export const savedSearchRoutes = Router();

savedSearchRoutes.use(requireAuth);
savedSearchRoutes.get("/", listSavedSearches);
savedSearchRoutes.post("/", validate(createSavedSearchSchema), createSavedSearch);
savedSearchRoutes.patch("/:searchId", validate(updateSavedSearchSchema), updateSavedSearch);
savedSearchRoutes.delete("/:searchId", validate(savedSearchIdSchema), deleteSavedSearch);

