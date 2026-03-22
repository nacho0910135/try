import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import {
  getHealthSummary,
  getLiveness,
  getReadiness
} from "./controllers/monitoringController.js";
import { handleStripeWebhook } from "./controllers/billingController.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";
import { attachRequestContext } from "./middlewares/requestContextMiddleware.js";
import { router } from "./routes/index.js";
import { logger } from "./utils/logger.js";

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(__dirname, "../public/uploads");

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localDevOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(:\d+)?$/;

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (env.NODE_ENV !== "production" && localDevOriginPattern.test(origin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    const corsError = new Error(`Origin not allowed by CORS: ${origin}`);
    corsError.statusCode = 403;
    return callback(corsError);
  },
  credentials: false
};

const requestLogFormat = (tokens, req, res) =>
  JSON.stringify({
    requestId: req.requestId,
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    responseTimeMs: Number(tokens["response-time"](req, res)),
    contentLength: tokens.res(req, res, "content-length") || "0",
    remoteAddress: tokens["remote-addr"](req, res),
    userAgent: tokens["user-agent"](req, res)
  });

app.use(
  cors(corsOptions)
);
app.options("*", cors(corsOptions));
app.use(attachRequestContext);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 400,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(
  morgan(requestLogFormat, {
    stream: {
      write: (line) => {
        try {
          logger.info("http_request", { http: JSON.parse(line) });
        } catch (_error) {
          logger.info("http_request", { raw: line.trim() });
        }
      }
    }
  })
);
app.use("/uploads", express.static(uploadsDirectory));

app.get("/api/health", getHealthSummary);
app.get("/api/health/live", getLiveness);
app.get("/api/health/ready", getReadiness);

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);
