"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { getVisibleMapContextPoints, mapContextLayers } from "@/lib/costa-rica-map-context";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { mapDefaultCenter } from "@/lib/constants";
import { getProvinceCode } from "@/lib/costa-rica-geo";
import { resolveMapStyle } from "@/lib/map-style";

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

const markerStylesByStatus = {
  available: {
    base: "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-500",
    selected: "border-emerald-900 bg-emerald-700 text-white ring-4 ring-emerald-200"
  },
  reserved: {
    base: "border-amber-700 bg-amber-500 text-white hover:bg-amber-400",
    selected: "border-amber-900 bg-amber-600 text-white ring-4 ring-amber-200"
  },
  sold: {
    base: "border-rose-700 bg-rose-600 text-white hover:bg-rose-500",
    selected: "border-rose-900 bg-rose-700 text-white ring-4 ring-rose-200"
  },
  rented: {
    base: "border-sky-700 bg-sky-600 text-white hover:bg-sky-500",
    selected: "border-sky-900 bg-sky-700 text-white ring-4 ring-sky-200"
  },
  inactive: {
    base: "border-slate-600 bg-slate-500 text-white hover:bg-slate-400",
    selected: "border-slate-800 bg-slate-600 text-white ring-4 ring-slate-200"
  }
};

export function SearchMap({
  properties = [],
  selectedPropertyId,
  selectedProvince,
  selectedDistrict,
  activeContextLayers = [],
  focusedContextPoint,
  onSelectProperty,
  onSelectDistrict,
  onSelectContextPoint,
  onBoundsChange,
  onPolygonChange
}) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = resolveMapStyle(process.env.NEXT_PUBLIC_MAPBOX_STYLE);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const provinceCode = getProvinceCode(selectedProvince);
  const visibleContextPoints = getVisibleMapContextPoints(activeContextLayers);

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
    if (!focusedContextPoint || !mapRef.current) {
      return;
    }

    mapRef.current.getMap().flyTo({
      center: [focusedContextPoint.lng, focusedContextPoint.lat],
      zoom: 11.6,
      duration: 1000
    });
  }, [focusedContextPoint]);

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
      <div className="surface flex min-h-[680px] flex-col items-center justify-center gap-3 p-8 text-center">
        <h3 className="text-lg font-semibold">{t("map.enableMapboxTitle")}</h3>
        <p className="max-w-md text-sm text-ink/60">{t("map.enableMapboxDescription")}</p>
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
        "#22c55e",
        "#3b82f6"
      ],
      "fill-opacity": [
        "case",
        ["==", ["get", "district"], selectedDistrict || ""],
        0.38,
        0.2
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
        "#15803d",
        "#ffffff"
      ],
      "line-width": [
        "case",
        ["==", ["get", "district"], selectedDistrict || ""],
        2.4,
        1.2
      ],
      "line-opacity": 0.9
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
          if (focusedContextPoint) {
            return;
          }

          const bounds = event.target.getBounds();

          onBoundsChange?.({
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
          });
        }}
        style={{ width: "100%", minHeight: 740 }}
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
          (() => {
            const marketStatus = property.marketStatus || "available";
            const markerStyle = markerStylesByStatus[marketStatus] || markerStylesByStatus.available;

            return (
              <Marker
                key={property._id}
                longitude={property.location.coordinates[0]}
                latitude={property.location.coordinates[1]}
                anchor="bottom"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectProperty?.(property._id);
                    router.push(`/properties/${property.slug}`);
                  }}
                  className={`rounded-full border-2 px-2.5 py-1.5 text-[11px] font-semibold shadow-soft transition ${
                    selectedPropertyId === property._id
                      ? markerStyle.selected
                      : markerStyle.base
                  }`}
                  aria-label={t("map.selectedAria", {
                    title: property.title,
                    price: formatCurrency(property.price, property.currency)
                  })}
                >
                  {formatCompactCurrency(property.price, property.currency)}
                </button>
              </Marker>
            );
          })()
        ))}

        {visibleContextPoints.map((point) => {
          const selected = focusedContextPoint?.id === point.id;

          return (
            <Marker
              key={point.id}
              longitude={point.lng}
              latitude={point.lat}
              anchor="bottom"
            >
              <button
                type="button"
                onClick={() => onSelectContextPoint?.(point)}
                className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-soft transition ${
                  selected ? "ring-4 ring-white/80 scale-105" : "opacity-90 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: point.color,
                  borderColor: "rgba(255,255,255,0.82)"
                }}
                aria-label={point.name}
              >
                {point.shortLabel || point.name}
              </button>
            </Marker>
          );
        })}
      </Map>

      {selectedProvince || activeContextLayers.length ? (
        <div className="space-y-2 border-t border-ink/10 bg-white/88 px-4 py-3 text-xs font-medium text-ink/65">
          {selectedProvince ? <div>{t("map.districtsHint", { province: selectedProvince })}</div> : null}
          {activeContextLayers.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
                {visibleContextPoints.length}{" "}
                {language === "en"
                  ? visibleContextPoints.length === 1
                    ? "context point"
                    : "context points"
                  : visibleContextPoints.length === 1
                    ? "punto de contexto"
                    : "puntos de contexto"}
              </span>
              {mapContextLayers
                .filter((layer) => activeContextLayers.includes(layer.id))
                .map((layer) => (
                  <span
                    key={layer.id}
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: layer.color }}
                  >
                    {language === "en" ? layer.labelEn : layer.labelEs}
                  </span>
                ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
