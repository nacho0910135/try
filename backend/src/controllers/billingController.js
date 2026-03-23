import { billingService } from "../services/billingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const session = await billingService.createCheckoutSession(req.user, req.body);
  res.json({ success: true, session });
});

export const createPortalSession = asyncHandler(async (req, res) => {
  const session = await billingService.createPortalSession(req.user);
  res.json({ success: true, session });
});

export const createPayPalBoostOrder = asyncHandler(async (req, res) => {
  const order = await billingService.createBoostOrder(req.user, req.body);
  res.json({ success: true, order });
});

export const createPayPalDonationOrder = asyncHandler(async (req, res) => {
  const order = await billingService.createDonationOrder(req.body, req.user);
  res.json({ success: true, order });
});

export const capturePayPalOrder = asyncHandler(async (req, res) => {
  const capture = await billingService.capturePaypalOrder(req.body.orderId);
  res.json({ success: true, capture });
});

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result = await billingService.handleWebhook(req.body, signature);
  res.json({ success: true, ...result });
});
