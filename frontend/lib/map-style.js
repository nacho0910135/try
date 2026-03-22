const DEFAULT_COLOR_STYLE = "mapbox://styles/mapbox/outdoors-v12";

export const resolveMapStyle = (style) => {
  const normalized = String(style || "").toLowerCase();

  if (!normalized) {
    return DEFAULT_COLOR_STYLE;
  }

  if (
    normalized.includes("light-v") ||
    normalized.includes("light-") ||
    normalized.includes("monochrome") ||
    normalized.includes("grayscale")
  ) {
    return DEFAULT_COLOR_STYLE;
  }

  return style;
};

export const defaultColorMapStyle = DEFAULT_COLOR_STYLE;
