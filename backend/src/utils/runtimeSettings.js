import fs from "fs/promises";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const SHOWCASE_KEY = "SHOW_SHOWCASE_SEED_PROPERTIES";
const envFilePath = fileURLToPath(new URL("../../.env", import.meta.url));

const getLineBreak = (content) => (content.includes("\r\n") ? "\r\n" : "\n");

export const getShowcaseSeedVisibility = () => Boolean(env.SHOW_SHOWCASE_SEED_PROPERTIES);

export const setShowcaseSeedVisibility = async (enabled) => {
  const nextValue = enabled ? "true" : "false";
  let envFile = "";

  try {
    envFile = await fs.readFile(envFilePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  const lineBreak = envFile ? getLineBreak(envFile) : "\n";
  const settingLine = `${SHOWCASE_KEY}=${nextValue}`;
  const settingPattern = new RegExp(`^${SHOWCASE_KEY}=.*$`, "m");

  if (settingPattern.test(envFile)) {
    envFile = envFile.replace(settingPattern, settingLine);
  } else {
    const trimmed = envFile.replace(/\s*$/, "");
    envFile = trimmed ? `${trimmed}${lineBreak}${settingLine}${lineBreak}` : `${settingLine}${lineBreak}`;
  }

  await fs.writeFile(envFilePath, envFile, "utf8");

  env.SHOW_SHOWCASE_SEED_PROPERTIES = enabled;
  process.env.SHOW_SHOWCASE_SEED_PROPERTIES = nextValue;

  return enabled;
};
