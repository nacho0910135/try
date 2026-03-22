import { Router } from "express";
import { captureFrontendError } from "../controllers/monitoringController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { frontendErrorSchema } from "../validators/monitoringValidators.js";

export const monitoringRoutes = Router();

monitoringRoutes.post("/frontend-error", validate(frontendErrorSchema), captureFrontendError);
