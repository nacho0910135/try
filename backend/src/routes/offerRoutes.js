import { Router } from "express";
import {
  createOffer,
  listReceivedOffers,
  listSentOffers,
  updateOfferStatus
} from "../controllers/offerController.js";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createOfferSchema, updateOfferStatusSchema } from "../validators/offerValidators.js";

export const offerRoutes = Router();

offerRoutes.post("/", optionalAuth, validate(createOfferSchema), createOffer);
offerRoutes.get("/received", requireAuth, listReceivedOffers);
offerRoutes.get("/sent", requireAuth, listSentOffers);
offerRoutes.patch("/:offerId/status", requireAuth, validate(updateOfferStatusSchema), updateOfferStatus);
