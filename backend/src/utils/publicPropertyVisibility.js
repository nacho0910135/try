import { env } from "../config/env.js";

export const SHOWCASE_LISTING_SOURCE = "showcase-seed";

export const withShowcaseVisibility = (filter = {}) => {
  if (env.SHOW_SHOWCASE_SEED_PROPERTIES) {
    return filter;
  }

  return {
    ...filter,
    listingSource: { $ne: SHOWCASE_LISTING_SOURCE }
  };
};

export const buildPublicPropertyFilter = () =>
  withShowcaseVisibility({
    status: "published",
    marketStatus: { $in: ["available", "reserved"] }
  });

export const buildPublicAnalyticsPropertyFilter = () =>
  withShowcaseVisibility({
    status: "published",
    marketStatus: { $ne: "inactive" }
  });

export const isPubliclyVisibleProperty = (property) =>
  property?.status === "published" &&
  (property?.marketStatus || "available") !== "inactive" &&
  (env.SHOW_SHOWCASE_SEED_PROPERTIES ||
    property?.listingSource !== SHOWCASE_LISTING_SOURCE);
