"use client";

import { useEffect, useRef, useState } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { mapDefaultCenter } from "@/lib/constants";
import { getProvinceCode } from "@/lib/costa-rica-geo";

const collectBounds = (coordinates, state) => {
  if (!Array.isArray(coordinates)) {
    return;
  }

  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    const [lng, lat] = coordinates;

    state.minLng = Math.min(state.minLng, lng);
    state.maxLng = Math.max(state.maxLng, lng);
    state.minLat = Math.min(state.minLat, lat);
    state.maxLat = Math.max(state.maxLat, lat);
    state.hasPoints = true;
    return;
  }

  coordinates.forEach((item) => collectBounds(item, state));
};

export function SearchMap({
  properties = [],
  selectedPropertyId,
  selectedProvince,
  selectedDistrict,
  onSelectProperty,
  onSelectDistrict,
  onBoundsChange,
  onPolygonChange
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/light-v11";
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const provinceCode = getProvinceCode(selectedProvince);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!provinceCode) {
        setDistrictGeoJson(null);
        return;
      }

      const response = await fetch(`/geo/districts/${provinceCode}.json`);
      setDistrictGeoJson(await response.json());
    };

    loadDistricts().catch(() => {
      setDistrictGeoJson(null);
    });
  }, [provinceCode]);

  useEffect(() => {
    if (!districtGeoJson || !mapRef.current) {
      return;
    }

    const state = {
      minLng: Infinity,
      maxLng: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity,
      hasPoints: false
    };

    districtGeoJson.features.forEach((feature) =>
      collectBounds(feature.geometry?.coordinates, state)
    );

    if (!state.hasPoints) {
      return;
    }

    mapRef.current
      .getMap()
      .fitBounds(
        [
          [state.minLng, state.minLat],
          [state.maxLng, state.maxLat]
        ],
        {
          padding: 36,
          duration: 700
        }
      );
  }, [districtGeoJson]);

  useEffect(() => {
    if (!token || !mapRef.current || drawRef.current) {
      return;
    }

    const map = mapRef.current.getMap();
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    drawRef.current = draw;
    map.addControl(draw, "top-left");

    const syncPolygon = () => {
      const [feature] = draw.getAll().features;
      const polygon = feature?.geometry?.coordinates?.[0] || null;
      onPolygonChange?.(polygon);
    };

    map.on("draw.create", syncPolygon);
    map.on("draw.update", syncPolygon);
    map.on("draw.delete", syncPolygon);

    return () => {
      map.off("draw.create", syncPolygon);
      map.off("draw.update", syncPolygon);
      map.off("draw.delete", syncPolygon);
      map.removeControl(draw);
      drawRef.current = null;
    };
  }, [token, onPolygonChange]);

  if (!token) {
    return (
      <div className="surface flex min-h-[520px] flex-col items-center justify-center gap-3 p-8 text-center">
        <h3 className="text-lg font-semibold">Activa Mapbox para ver el mapa interactivo</h3>
        <p className="max-w-md text-sm text-ink/60">
          Configura `NEXT_PUBLIC_MAPBOX_TOKEN` en el frontend para usar bounds, pines y dibujo de zonas.
        </p>
      </div>
    );
  }

  const districtFillLayer = {
    id: "district-fills",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "district"], selectedDistrict || ""],
        "#ff7a3d",
        "#17324e"
      ],
      "fill-opacity": [
        "case",
        ["==", ["get", "district"], selectedDistrict || ""],
        0.34,
        0.12
      ]
    }
  };

  const districtLineLayer = {
    id: "district-lines",
    type: "line",
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "district"], selectedDistrict || ""],
        "#ff7a3d",
        "#7f96ad"
      ],
      "line-width": [
        "case",
        ["==", ["get", "district"], selectedDistrict || ""],
        2.2,
        1.1
      ],
      "line-opacity": 0.82
    }
  };

  return (
    <div className="surface overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapLib={mapboxgl}
        mapStyle={mapStyle}
        initialViewState={mapDefaultCenter}
        interactiveLayerIds={districtGeoJson ? ["district-fills"] : []}
        minZoom={5}
        onClick={(event) => {
          const districtFeature = event.features?.find(
            (feature) => feature.layer.id === "district-fills"
          );

          if (!districtFeature?.properties?.district) {
            return;
          }

          onSelectDistrict?.({
            province: districtFeature.properties.province,
            canton: districtFeature.properties.canton,
            district: districtFeature.properties.district
          });
        }}
        onMoveEnd={(event) => {
          const bounds = event.target.getBounds();

          onBoundsChange?.({
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
          });
        }}
        style={{ width: "100%", minHeight: 520 }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation={false} showUserHeading />

        {districtGeoJson ? (
          <Source id="cr-districts" type="geojson" data={districtGeoJson}>
            <Layer {...districtFillLayer} />
            <Layer {...districtLineLayer} />
          </Source>
        ) : null}

        {properties.map((property) => (
          <Marker
            key={property._id}
            longitude={property.location.coordinates[0]}
            latitude={property.location.coordinates[1]}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={() => onSelectProperty?.(property._id)}
              className={`rounded-full border-2 px-2.5 py-1.5 text-[11px] font-semibold shadow-soft transition ${
                selectedPropertyId === property._id
                  ? "border-terracotta bg-terracotta text-white"
                  : "border-white/80 bg-white/95 text-ink hover:-translate-y-0.5"
              }`}
              aria-label={`Seleccionar ${property.title} por ${formatCurrency(
                property.price,
                property.currency
              )}`}
            >
              {formatCompactCurrency(property.price, property.currency)}
            </button>
          </Marker>
        ))}
      </Map>

      {selectedProvince ? (
        <div className="border-t border-ink/10 bg-white/88 px-4 py-3 text-xs font-medium text-ink/65">
          Distritos interactivos de {selectedProvince}: toca un distrito en el mapa para filtrar propiedades de esa zona.
        </div>
      ) : null}
    </div>
  );
}
