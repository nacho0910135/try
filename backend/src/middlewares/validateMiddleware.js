import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    req.body = parsed.body ?? req.body;
    req.query = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        new ApiError(
          400,
          "Validation failed",
          error.flatten().fieldErrors
        )
      );
    }

    return next(error);
  }
};

