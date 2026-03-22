import { env } from "../config/env.js";
import { savedSearchService } from "../services/savedSearchService.js";
import { logger } from "../utils/logger.js";

let schedulerHandle;
let schedulerRunning = false;

const runAlertsCycle = async () => {
  if (schedulerRunning) {
    return;
  }

  schedulerRunning = true;

  try {
    const summary = await savedSearchService.dispatchDueAlerts();
    logger.info("automatic_saved_search_alerts_processed", summary);
  } catch (error) {
    logger.error("automatic_saved_search_alerts_failed", { error });
  } finally {
    schedulerRunning = false;
  }
};

export const startAlertScheduler = () => {
  if (!env.ALERTS_AUTORUN) {
    return null;
  }

  if (schedulerHandle) {
    return schedulerHandle;
  }

  const intervalMs = env.ALERTS_INTERVAL_MINUTES * 60 * 1000;
  schedulerHandle = setInterval(runAlertsCycle, intervalMs);

  if (typeof schedulerHandle.unref === "function") {
    schedulerHandle.unref();
  }

  runAlertsCycle();

  logger.info("automatic_saved_search_alerts_enabled", {
    intervalMinutes: env.ALERTS_INTERVAL_MINUTES
  });

  return schedulerHandle;
};
