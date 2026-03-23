import { getProvinceCode } from "./costa-rica-geo.js";

const geoJsonCache = new Map();
const SEGMENT_EPSILON = 1e-9;

const loadGeoJson = async (path) => {
  const cached = geoJsonCache.get(path);
  if (cached) {
    return cached;
  }

  const request = fetch(path).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to load geo data from ${path}`);
    }

    return response.json();
  });

  geoJsonCache.set(path, request);

  try {
    return await request;
  } catch (error) {
    geoJsonCache.delete(path);
    throw error;
  }
};

const isPointOnSegment = ([px, py], [x1, y1], [x2, y2]) => {
  const cross = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);

  if (Math.abs(cross) > SEGMENT_EPSILON) {
    return false;
  }

  const dot = (px - x1) * (px - x2) + (py - y1) * (py - y2);
  return dot <= SEGMENT_EPSILON;
};

const isPointInRing = (point, ring = []) => {
  if (!Array.isArray(ring) || ring.length < 4) {
    return false;
  }

  const [px, py] = point;
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const currentPoint = ring[index];
    const previousPoint = ring[previous];

    if (isPointOnSegment(point, currentPoint, previousPoint)) {
      return true;
    }

    const [x1, y1] = currentPoint;
    const [x2, y2] = previousPoint;
    const crossesHorizontalLine = (y1 > py) !== (y2 > py);

    if (!crossesHorizontalLine) {
      continue;
    }

    const intersectX = ((x2 - x1) * (py - y1)) / (y2 - y1) + x1;

    if (px < intersectX) {
      inside = !inside;
    }
  }

  return inside;
};

const isPointInPolygon = (point, polygon = []) => {
  if (!Array.isArray(polygon) || !polygon.length || !isPointInRing(point, polygon[0])) {
    return false;
  }

  for (let index = 1; index < polygon.length; index += 1) {
    if (isPointInRing(point, polygon[index])) {
      return false;
    }
  }

  return true;
};

const isPointInGeometry = (point, geometry) => {
  if (!geometry?.type || !Array.isArray(geometry.coordinates)) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return isPointInPolygon(point, geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => isPointInPolygon(point, polygon));
  }

  return false;
};

const findContainingFeature = (features = [], point) =>
  features.find((feature) => isPointInGeometry(point, feature.geometry)) || null;

export const reverseGeocodeCostaRica = async ({ lat, lng }) => {
  const numericLat = Number(lat);
  const numericLng = Number(lng);

  if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
    return null;
  }

  const point = [numericLng, numericLat];
  const provinceCollection = await loadGeoJson("/geo/cr-provinces.json");
  const provinceFeature = findContainingFeature(provinceCollection.features, point);

  if (!provinceFeature) {
    return null;
  }

  const province = provinceFeature.properties?.name;
  const provinceCode = provinceFeature.properties?.code || getProvinceCode(province);

  if (!provinceCode) {
    return province
      ? {
          province,
          label: province
        }
      : null;
  }

  const districtCollection = await loadGeoJson(`/geo/districts/${provinceCode}.json`);
  const districtFeature = findContainingFeature(districtCollection.features, point);

  if (!districtFeature) {
    return province
      ? {
          province,
          provinceCode,
          label: province
        }
      : null;
  }

  const canton = districtFeature.properties?.canton || "";
  const district = districtFeature.properties?.district || "";
  const label = [district, canton, province].filter(Boolean).join(", ");

  return {
    province,
    provinceCode,
    canton,
    district,
    districtCode: districtFeature.properties?.code || "",
    label
  };
};
