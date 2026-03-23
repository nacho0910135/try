"use client";

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Expand, MapPinned, Sparkles } from "lucide-react";
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { getVisibleMapContextPoints, mapContextLayers } from "@/lib/costa-rica-map-context";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";
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
    base: "border-emerald-700/90 bg-emerald-600/95 text-white hover:-translate-y-0.5 hover:bg-emerald-500",
    selected: "border-emerald-900 bg-emerald-700 text-white ring-4 ring-emerald-200"
  },
  reserved: {
    base: "border-amber-700/90 bg-amber-500/95 text-white hover:-translate-y-0.5 hover:bg-amber-400",
    selected: "border-amber-900 bg-amber-600 text-white ring-4 ring-amber-200"
  },
  sold: {
    base: "border-rose-700/90 bg-rose-600/95 text-white hover:-translate-y-0.5 hover:bg-rose-500",
    selected: "border-rose-900 bg-rose-700 text-white ring-4 ring-rose-200"
  },
  rented: {
    base: "border-sky-700/90 bg-sky-600/95 text-white hover:-translate-y-0.5 hover:bg-sky-500",
    selected: "border-sky-900 bg-sky-700 text-white ring-4 ring-sky-200"
  },
  inactive: {
    base: "border-slate-600/90 bg-slate-500/95 text-white hover:-translate-y-0.5 hover:bg-slate-400",
    selected: "border-slate-800 bg-slate-600 text-white ring-4 ring-slate-200"
  }
};

const districtGeoJsonCache = new Map();
const districtGeoJsonPromiseCache = new Map();
const geoJsonBoundsCache = new WeakMap();

const loadCachedGeoJson = async (cacheKey, resourcePath) => {
  if (districtGeoJsonCache.has(cacheKey)) {
    return districtGeoJsonCache.get(cacheKey);
  }

  if (districtGeoJsonPromiseCache.has(cacheKey)) {
    return districtGeoJsonPromiseCache.get(cacheKey);
  }

  const request = fetch(resourcePath)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${resourcePath}`);
      }

      const data = await response.json();
      districtGeoJsonCache.set(cacheKey, data);
      districtGeoJsonPromiseCache.delete(cacheKey);
      return data;
    })
    .catch((error) => {
      districtGeoJsonPromiseCache.delete(cacheKey);
      throw error;
    });

  districtGeoJsonPromiseCache.set(cacheKey, request);
  return request;
};

const getGeoJsonBounds = (featureCollection) => {
  if (!featureCollection) {
    return null;
  }

  if (geoJsonBoundsCache.has(featureCollection)) {
    return geoJsonBoundsCache.get(featureCollection);
  }

  const state = {
    minLng: Infinity,
    maxLng: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity,
    hasPoints: false
  };

  featureCollection.features?.forEach((feature) =>
    collectBounds(feature.geometry?.coordinates, state)
  );

  const bounds = state.hasPoints
    ? [
        [state.minLng, state.minLat],
        [state.maxLng, state.maxLat]
      ]
    : null;

  geoJsonBoundsCache.set(featureCollection, bounds);
  return bounds;
};

const PriceMarker = memo(function PriceMarker({ property, isSelected, ariaLabel, onOpenProperty }) {
  const marketStatus = property.marketStatus || "available";
  const markerStyle = markerStylesByStatus[marketStatus] || markerStylesByStatus.available;

  return (
    <Marker
      longitude={property.location.coordinates[0]}
      latitude={property.location.coordinates[1]}
      anchor="bottom"
    >
      <button
        type="button"
        onClick={() => onOpenProperty(property)}
        className="group relative -m-2 rounded-full p-2 focus:outline-none"
        aria-label={ariaLabel}
      >
        <span
          className={`inline-flex rounded-full border-2 px-2 py-1.5 text-[10px] font-semibold shadow-[0_14px_28px_rgba(17,34,54,0.16)] backdrop-blur transition duration-150 ease-out sm:px-3 sm:py-1.5 sm:text-[11px] ${
            isSelected
              ? `${markerStyle.selected} scale-[1.08]`
              : `${markerStyle.base} group-hover:scale-[1.13] group-focus-visible:scale-[1.13]`
          }`}
        >
          {formatCompactCurrency(property.price, property.currency)}
        </span>
      </button>
    </Marker>
  );
});

const ContextPointMarker = memo(function ContextPointMarker({ point, isSelected, onSelectContextPoint }) {
  return (
    <Marker longitude={point.lng} latitude={point.lat} anchor="bottom">
      <button
        type="button"
        onClick={() => onSelectContextPoint?.(point)}
        className={`rounded-full border px-2 py-1.5 text-[9px] font-semibold text-white shadow-soft transition sm:px-2.5 sm:py-1.5 sm:text-[10px] ${
          isSelected ? "scale-105 ring-4 ring-white/80" : "opacity-90 hover:opacity-100"
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
});

const SearchMapComponent = function SearchMap({
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
  onPolygonChange,
  minHeight = 740,
  className
}) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = resolveMapStyle(process.env.NEXT_PUBLIC_MAPBOX_STYLE);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const provinceCode = getProvinceCode(selectedProvince);
  const deferredProperties = useDeferredValue(properties);
  const deferredActiveContextLayers = useDeferredValue(activeContextLayers);
  const visibleContextPoints = useMemo(
    () => getVisibleMapContextPoints(deferredActiveContextLayers),
    [deferredActiveContextLayers]
  );
  const districtLayerIds = useMemo(
    () => (districtGeoJson ? ["district-fills"] : []),
    [districtGeoJson]
  );
  const activeContextLayerMeta = useMemo(
    () => mapContextLayers.filter((layer) => activeContextLayers.includes(layer.id)),
    [activeContextLayers]
  );
  const districtFillLayer = useMemo(
    () => ({
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
    }),
    [selectedDistrict]
  );
  const districtLineLayer = useMemo(
    () => ({
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
    }),
    [selectedDistrict]
  );

  const handleOpenProperty = useCallback(
    (property) => {
      onSelectProperty?.(property._id);
      router.push(`/properties/${property.slug}`);
    },
    [onSelectProperty, router]
  );

  const handleDistrictClick = useCallback(
    (event) => {
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
    },
    [onSelectDistrict]
  );

  const propertyMarkers = useMemo(
    () =>
      deferredProperties
        .filter(
          (property) =>
            property?.location?.coordinates &&
            Number.isFinite(property.location.coordinates[0]) &&
            Number.isFinite(property.location.coordinates[1])
        )
        .map((property) => (
          <PriceMarker
            key={property._id}
            property={property}
            isSelected={selectedPropertyId === property._id}
            ariaLabel={t("map.selectedAria", {
              title: property.title,
              price: formatCurrency(property.price, property.currency)
            })}
            onOpenProperty={handleOpenProperty}
          />
        )),
    [deferredProperties, handleOpenProperty, selectedPropertyId, t]
  );

  const contextMarkers = useMemo(
    () =>
      visibleContextPoints.map((point) => (
        <ContextPointMarker
          key={point.id}
          point={point}
          isSelected={focusedContextPoint?.id === point.id}
          onSelectContextPoint={onSelectContextPoint}
        />
      )),
    [focusedContextPoint?.id, onSelectContextPoint, visibleContextPoints]
  );

  useEffect(() => {
    let cancelled = false;

    const loadDistricts = async () => {
      if (!provinceCode) {
        setDistrictGeoJson(null);
        return;
      }

      const data = await loadCachedGeoJson(
        `districts-${provinceCode}`,
        `/geo/districts/${provinceCode}.json`
      );

      if (!cancelled) {
        setDistrictGeoJson(data);
      }
    };

    loadDistricts().catch(() => {
      if (!cancelled) {
        setDistrictGeoJson(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  useEffect(() => {
    if (!districtGeoJson || !mapRef.current) {
      return;
    }

    const bounds = getGeoJsonBounds(districtGeoJson);

    if (!bounds) {
      return;
    }

    mapRef.current.getMap().fitBounds(bounds, {
      padding: 36,
      duration: 700
    });
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
      <div className="surface flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
        <h3 className="text-lg font-semibold">{t("map.enableMapboxTitle")}</h3>
        <p className="max-w-md text-sm text-ink/60">{t("map.enableMapboxDescription")}</p>
      </div>
    );
  }

  return (
    <div className={cn("map-stage", className)}>
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
        <div className="surface-soft px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pine/75">
            {language === "en" ? "Live price field" : "Campo de precios"}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-ink sm:text-sm">
            <MapPinned className="h-4 w-4 shrink-0 text-terracotta" />
            {selectedProvince || "Costa Rica"}
            <span className="text-ink/35">{"\u00b7"}</span>
            {properties.length} {language === "en" ? "results" : "resultados"}
          </div>
        </div>
        <div className="surface-soft hidden items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/60 md:inline-flex">
          <Expand className="h-3.5 w-3.5 text-lagoon" />
          {language === "en" ? "Drag, zoom, draw" : "Arrastra, acerca, dibuja"}
        </div>
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapLib={mapboxgl}
        mapStyle={mapStyle}
        reuseMaps
        initialViewState={mapDefaultCenter}
        interactiveLayerIds={districtLayerIds}
        minZoom={5}
        renderWorldCopies={false}
        onClick={handleDistrictClick}
        style={{
          width: "100%",
          height:
            typeof minHeight === "number"
              ? `clamp(360px, 58svh, ${minHeight}px)`
              : "clamp(360px, 58svh, 760px)"
        }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation={false} showUserHeading />

        {districtGeoJson ? (
          <Source id="cr-districts" type="geojson" data={districtGeoJson}>
            <Layer {...districtFillLayer} />
            <Layer {...districtLineLayer} />
          </Source>
        ) : null}

        {propertyMarkers}

        {contextMarkers}
      </Map>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f24301c] via-transparent to-transparent" />

      {selectedProvince || activeContextLayers.length ? (
        <div className="space-y-2 border-t border-ink/10 bg-white/90 px-3 py-3 text-xs font-medium text-ink/65 sm:px-4">
          {selectedProvince ? (
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 text-terracotta" />
              <span>{t("map.districtsHint", { province: selectedProvince })}</span>
            </div>
          ) : null}
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
              {activeContextLayerMeta.map((layer) => (
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
};

export const SearchMap = memo(SearchMapComponent);
