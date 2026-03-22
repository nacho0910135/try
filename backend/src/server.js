import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`AlquiVentasCR API listening on http://localhost:${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
