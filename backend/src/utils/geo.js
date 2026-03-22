export const buildBoundsPolygon = ({ west, south, east, north }) => ({
  type: "Polygon",
  coordinates: [[
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south]
  ]]
});

export const normalizePolygonCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return null;
  }

  const normalized = coordinates.map((coordinate) => [
    Number(coordinate[0]),
    Number(coordinate[1])
  ]);

  const [firstLng, firstLat] = normalized[0];
  const [lastLng, lastLat] = normalized[normalized.length - 1];

  if (firstLng !== lastLng || firstLat !== lastLat) {
    normalized.push([firstLng, firstLat]);
  }

  return normalized;
};

