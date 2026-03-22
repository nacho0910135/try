import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);
  mongoose.connection.on("connected", () => {
    logger.info("mongodb_connected", {
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  });
  mongoose.connection.on("error", (error) => {
    logger.error("mongodb_error", { error });
  });
  mongoose.connection.on("disconnected", () => {
    logger.warn("mongodb_disconnected");
  });
  await mongoose.connect(env.MONGODB_URI);
};
