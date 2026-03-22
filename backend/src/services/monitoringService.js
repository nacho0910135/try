import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const mongoStateLabels = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting"
};

const sendWebhook = async (payload) => {
  if (!env.MONITORING_WEBHOOK_URL) {
    return { forwarded: false, mode: "disabled" };
  }

  try {
    const response = await fetch(env.MONITORING_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return {
      forwarded: response.ok,
      mode: response.ok ? "webhook" : "webhook-error"
    };
  } catch (error) {
    logger.warn("monitoring_webhook_failed", { error });
    return { forwarded: false, mode: "webhook-error" };
  }
};

export const monitoringService = {
  getHealthSummary() {
    const mongoReadyState = mongoose.connection.readyState;
    const mongodb = mongoStateLabels[mongoReadyState] || "unknown";
    const healthy = mongoReadyState === 1;

    return {
      status: healthy ? "ok" : "degraded",
      service: "BienesRaicesCR-api",
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        mongodb
      },
      memory: {
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    };
  },

  async captureFrontendError(report) {
    const payload = {
      type: "frontend-error",
      service: "BienesRaicesCR-web",
      receivedAt: new Date().toISOString(),
      ...report
    };

    logger.error("frontend_runtime_error", payload);
    await sendWebhook(payload);
  },

  async captureServerError({ error, req, statusCode }) {
    const payload = {
      type: "backend-error",
      service: "BienesRaicesCR-api",
      receivedAt: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      ip: req.ip,
      error
    };

    if (statusCode >= 500) {
      logger.error("backend_request_error", payload);
    } else {
      logger.warn("backend_request_warning", payload);
    }

    if (statusCode >= 500) {
      await sendWebhook(payload);
    }
  }
};
