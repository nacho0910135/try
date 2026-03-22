import { Router } from "express";
import { analysisRoutes } from "./analysisRoutes.js";
import { adminRoutes } from "./adminRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { billingRoutes } from "./billingRoutes.js";
import { favoriteRoutes } from "./favoriteRoutes.js";
import { leadRoutes } from "./leadRoutes.js";
import { monitoringRoutes } from "./monitoringRoutes.js";
import { offerRoutes } from "./offerRoutes.js";
import { propertyRoutes } from "./propertyRoutes.js";
import { savedSearchRoutes } from "./savedSearchRoutes.js";
import { uploadRoutes } from "./uploadRoutes.js";
import { userRoutes } from "./userRoutes.js";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/analysis", analysisRoutes);
router.use("/billing", billingRoutes);
router.use("/properties", propertyRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/saved-searches", savedSearchRoutes);
router.use("/leads", leadRoutes);
router.use("/monitoring", monitoringRoutes);
router.use("/offers", offerRoutes);
router.use("/uploads", uploadRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
