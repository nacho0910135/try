import { Router } from "express";
import {
  capturePayPalOrder,
  createCheckoutSession,
  createPayPalBoostOrder,
  createPayPalDonationOrder,
  createPortalSession
} from "../controllers/billingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  capturePaypalOrderSchema,
  checkoutSessionSchema,
  paypalBoostOrderSchema,
  paypalDonationOrderSchema
} from "../validators/billingValidators.js";

export const billingRoutes = Router();

billingRoutes.post(
  "/paypal/donation-order",
  validate(paypalDonationOrderSchema),
  createPayPalDonationOrder
);
billingRoutes.post("/paypal/capture-order", validate(capturePaypalOrderSchema), capturePayPalOrder);

billingRoutes.use(requireAuth);
billingRoutes.post("/paypal/boost-order", validate(paypalBoostOrderSchema), createPayPalBoostOrder);
billingRoutes.post("/checkout-session", validate(checkoutSessionSchema), createCheckoutSession);
billingRoutes.post("/portal-session", createPortalSession);
