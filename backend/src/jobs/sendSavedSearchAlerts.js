import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { savedSearchService } from "../services/savedSearchService.js";

const run = async () => {
  await connectDatabase();

  try {
    const summary = await savedSearchService.dispatchDueAlerts();
    console.log("Saved search alerts processed", summary);
  } finally {
    await mongoose.connection.close();
  }
};

run().catch(async (error) => {
  console.error("Failed to send saved search alerts", error);
  await mongoose.connection.close();
  process.exit(1);
});
