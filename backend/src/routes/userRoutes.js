import { Router } from "express";
import { getDashboardSummary } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get("/dashboard-summary", getDashboardSummary);

