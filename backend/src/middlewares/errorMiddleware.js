import mongoose from "mongoose";
import { env } from "../config/env.js";
import { monitoringService } from "../services/monitoringService.js";

export const notFoundHandler = (req, _res, next) => {
  next({ statusCode: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = async (error, req, res, _next) => {
  const statusCode =
    error.statusCode ||
    (error instanceof mongoose.Error.ValidationError ? 400 : 500);

  const message =
    error.code === 11000
      ? "A resource with that unique field already exists"
      : error.message || "Internal server error";

  await monitoringService.captureServerError({ error, req, statusCode });

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null,
    requestId: req.requestId,
    stack: env.NODE_ENV === "production" ? undefined : error.stack
  });
};
