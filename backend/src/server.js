import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { startAlertScheduler } from "./jobs/alertScheduler.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, env.HOST, () => {
    logger.info("server_started", {
      host: env.HOST,
      port: env.PORT,
      environment: env.NODE_ENV
    });
  });

  startAlertScheduler();
};

startServer().catch((error) => {
  logger.error("server_start_failed", { error });
  process.exit(1);
});
