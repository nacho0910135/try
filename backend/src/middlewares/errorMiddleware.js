import mongoose from "mongoose";
import { env } from "../config/env.js";

export const notFoundHandler = (req, _res, next) => {
  next({ statusCode: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode =
    error.statusCode ||
    (error instanceof mongoose.Error.ValidationError ? 400 : 500);

  const message =
    error.code === 11000
      ? "A resource with that unique field already exists"
      : error.message || "Internal server error";

  if (env.NODE_ENV !== "production") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null,
    stack: env.NODE_ENV === "production" ? undefined : error.stack
  });
};

