import { trackPropertyBoostMetric } from "./api";

export const boostSurfaceSources = ["home", "search-rail", "map"];

const boostMetricKeys = {
  homeImpression: "home-impression",
  searchRailImpression: "search-rail-impression",
  mapImpression: "map-impression",
  cardOpen: "card-open",
  lead: "lead"
};

const attributionKeyPrefix = "bienesraicescr-boost-attribution";
const onceKeyPrefix = "bienesraicescr-boost-metric";

const normalizeBoostSurface = (value = "") =>
  boostSurfaceSources.includes(value) ? value : "";

const buildOnceKey = (propertyId, metric, context = "") =>
  [onceKeyPrefix, propertyId, metric, context].filter(Boolean).join(":");

export const boostMetrics = boostMetricKeys;

export const buildBoostPropertyHref = (slug, surface = "", featured = false) => {
  const safeSlug = String(slug || "").trim();

  if (!safeSlug) {
    return "/search";
  }

  const normalizedSurface = normalizeBoostSurface(surface);
  const basePath = `/properties/${safeSlug}`;

  if (!featured || !normalizedSurface) {
    return basePath;
  }

  const params = new URLSearchParams({ boostSurface: normalizedSurface });
  return `${basePath}?${params.toString()}`;
};

export const rememberBoostSurface = (propertyId, surface = "") => {
  if (typeof window === "undefined" || !propertyId) {
    return;
  }

  const normalizedSurface = normalizeBoostSurface(surface);

  if (!normalizedSurface) {
    return;
  }

  window.sessionStorage.setItem(
    `${attributionKeyPrefix}:${propertyId}`,
    normalizedSurface
  );
};

export const readRememberedBoostSurface = (propertyId) => {
  if (typeof window === "undefined" || !propertyId) {
    return "";
  }

  return normalizeBoostSurface(
    window.sessionStorage.getItem(`${attributionKeyPrefix}:${propertyId}`) || ""
  );
};

export const readBoostSurfaceFromSearchParams = (searchParams) =>
  normalizeBoostSurface(searchParams?.get?.("boostSurface") || "");

export const trackBoostMetric = async (propertyId, metric) => {
  if (typeof window === "undefined" || !propertyId || !metric) {
    return false;
  }

  try {
    const response = await trackPropertyBoostMetric(propertyId, { metric });
    return Boolean(response.recorded);
  } catch (_error) {
    return false;
  }
};

export const trackBoostMetricOnce = async (propertyId, metric, context = "") => {
  if (typeof window === "undefined" || !propertyId || !metric) {
    return false;
  }

  const storageKey = buildOnceKey(propertyId, metric, context);

  if (window.sessionStorage.getItem(storageKey)) {
    return false;
  }

  const recorded = await trackBoostMetric(propertyId, metric);

  if (recorded) {
    window.sessionStorage.setItem(storageKey, "1");
  }

  return recorded;
};
