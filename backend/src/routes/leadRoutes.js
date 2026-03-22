import { Router } from "express";
import {
  createLead,
  listReceivedLeads,
  listSentLeads,
  updateLead
} from "../controllers/leadController.js";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createLeadSchema, updateLeadSchema } from "../validators/leadValidators.js";

export const leadRoutes = Router();

leadRoutes.post("/", optionalAuth, validate(createLeadSchema), createLead);
leadRoutes.get("/received", requireAuth, listReceivedLeads);
leadRoutes.get("/sent", requireAuth, listSentLeads);
leadRoutes.patch("/:leadId", requireAuth, validate(updateLeadSchema), updateLead);
