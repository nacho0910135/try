import { getMapContextLayer, getVisibleMapContextPoints } from "./costa-rica-map-context";

const toRadians = (value) => (value * Math.PI) / 180;

export const calculateDistanceKm = (firstLat, firstLng, secondLat, secondLng) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(secondLat - firstLat);
  const dLng = toRadians(secondLng - firstLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(firstLat)) *
      Math.cos(toRadians(secondLat)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getPropertyContextMatches = (
  property,
  activeLayerIds = [],
  maxDistanceKm = 12
) => {
  const coordinates = property?.location?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return [];
  }

  const [lng, lat] = coordinates;

  return getVisibleMapContextPoints(activeLayerIds)
    .map((point) => {
      const distanceKm = calculateDistanceKm(lat, lng, point.lat, point.lng);
      const layer = getMapContextLayer(point.layerId);

      return {
        ...point,
        distanceKm,
        layerLabelEs: layer?.labelEs || point.layerId,
        layerLabelEn: layer?.labelEn || point.layerId
      };
    })
    .filter((point) => point.distanceKm <= maxDistanceKm)
    .sort((first, second) => first.distanceKm - second.distanceKm);
};

export const buildContextResultsSummary = (
  properties = [],
  activeLayerIds = [],
  maxDistanceKm = 12
) => {
  const enriched = properties.map((property) => {
    const contextMatches = getPropertyContextMatches(property, activeLayerIds, maxDistanceKm);

    return {
      property,
      contextMatches
    };
  });

  const layerCounts = activeLayerIds
    .map((layerId) => {
      const layer = getMapContextLayer(layerId);
      const count = enriched.filter(({ contextMatches }) =>
        contextMatches.some((match) => match.layerId === layerId)
      ).length;

      return {
        id: layerId,
        color: layer?.color || "#0f172a",
        labelEs: layer?.labelEs || layerId,
        labelEn: layer?.labelEn || layerId,
        count
      };
    })
    .filter((item) => item.count > 0)
    .sort((first, second) => second.count - first.count);

  const districtCounts = enriched.reduce((accumulator, { property, contextMatches }) => {
    if (!contextMatches.length) {
      return accumulator;
    }

    const districtKey = [
      property?.address?.district,
      property?.address?.canton,
      property?.address?.province
    ]
      .filter(Boolean)
      .join(", ");

    if (!districtKey) {
      return accumulator;
    }

    accumulator[districtKey] = (accumulator[districtKey] || 0) + 1;
    return accumulator;
  }, {});

  const topDistricts = Object.entries(districtCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 3);

  const strongestMatch = enriched
    .flatMap(({ property, contextMatches }) =>
      contextMatches.map((match) => ({
        propertyId: property?._id,
        propertyTitle: property?.title,
        ...match
      }))
    )
    .sort((first, second) => first.distanceKm - second.distanceKm)[0];

  return {
    layerCounts,
    topDistricts,
    strongestMatch,
    matchedProperties: enriched.filter(({ contextMatches }) => contextMatches.length).length
  };
};
