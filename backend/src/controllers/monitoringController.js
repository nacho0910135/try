import { monitoringService } from "../services/monitoringService.js";

export const getHealthSummary = (_req, res) => {
  const summary = monitoringService.getHealthSummary();
  res.status(summary.status === "ok" ? 200 : 503).json({
    success: summary.status === "ok",
    ...summary
  });
};

export const getLiveness = (_req, res) => {
  res.json({
    success: true,
    status: "alive",
    service: "BienesRaicesCR-api",
    timestamp: new Date().toISOString()
  });
};

export const getReadiness = (_req, res) => {
  const summary = monitoringService.getHealthSummary();
  const ready = summary.services.mongodb === "connected";

  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? "ready" : "not-ready",
    service: summary.service,
    services: summary.services,
    timestamp: summary.timestamp
  });
};

export const captureFrontendError = async (req, res) => {
  await monitoringService.captureFrontendError({
    requestId: req.requestId,
    ...req.body
  });

  res.status(202).json({
    success: true
  });
};
