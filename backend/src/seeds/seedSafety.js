import { env } from "../config/env.js";

const isExplicitProductionOverrideEnabled = () => {
  const value = String(process.env.ALLOW_PRODUCTION_SEED || "").trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
};

export const assertSafeToSeed = (seedName = "seed") => {
  if (env.NODE_ENV !== "production") {
    return;
  }

  if (isExplicitProductionOverrideEnabled()) {
    console.warn(
      `[seed] ${seedName} is running in production because ALLOW_PRODUCTION_SEED=true was provided explicitly.`
    );
    return;
  }

  throw new Error(
    `Refusing to run ${seedName} in production. Set ALLOW_PRODUCTION_SEED=true only for an intentional, temporary operation.`
  );
};
