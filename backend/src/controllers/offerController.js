import { offerService } from "../services/offerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.create(req.body, req.user);
  res.status(201).json({ success: true, offer });
});

export const listReceivedOffers = asyncHandler(async (req, res) => {
  const data = await offerService.listReceived(req.user, req.query);
  res.json({ success: true, ...data });
});

export const listSentOffers = asyncHandler(async (req, res) => {
  const data = await offerService.listSent(req.user, req.query);
  res.json({ success: true, ...data });
});

export const updateOfferStatus = asyncHandler(async (req, res) => {
  const offer = await offerService.updateStatus(req.params.offerId, req.user, req.body.status);
  res.json({ success: true, offer });
});
