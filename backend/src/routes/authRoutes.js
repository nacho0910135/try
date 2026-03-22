import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateProfile
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  authLoginLimiter,
  authRecoveryLimiter,
  authRegisterLimiter
} from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../validators/authValidators.js";

export const authRoutes = Router();

authRoutes.post("/register", authRegisterLimiter, validate(registerSchema), register);
authRoutes.post("/login", authLoginLimiter, validate(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.post("/forgot-password", authRecoveryLimiter, validate(forgotPasswordSchema), forgotPassword);
authRoutes.post("/reset-password", authRecoveryLimiter, validate(resetPasswordSchema), resetPassword);
authRoutes.get("/me", requireAuth, me);
authRoutes.patch("/me", requireAuth, validate(updateProfileSchema), updateProfile);
