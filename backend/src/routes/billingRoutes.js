import { Router } from "express";
import {
  createCheckoutSession,
  createPortalSession
} from "../controllers/billingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { checkoutSessionSchema } from "../validators/billingValidators.js";

export const billingRoutes = Router();

billingRoutes.use(requireAuth);
billingRoutes.post("/checkout-session", validate(checkoutSessionSchema), createCheckoutSession);
billingRoutes.post("/portal-session", createPortalSession);
