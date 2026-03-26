"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapPinned, Sparkles } from "lucide-react";
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { useLanguage } from "@/components/layout/LanguageProvider";
import {
  buildBoostPropertyHref,
  boostMetrics,
  trackBoostMetricOnce
} from "@/lib/boost-metrics";
import { getVisibleMapContextPoints, mapContextLayers } from "@/lib/costa-rica-map-context";
import { cn, formatCompactCurrency } from "@/lib/utils";
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

const safeMapProperties = (properties = []) =>
  properties.filter(
    (property) =>
      property &&
      Array.isArray(property.location?.coordinates) &&
      Number.isFinite(property.location.coordinates[0]) &&
      Number.isFinite(property.location.coordinates[1])
  );

const safeContextPoints = (layerIds = []) =>
  getVisibleMapContextPoints(layerIds).filter(
    (point) => point && Number.isFinite(point.lng) && Number.isFinite(point.lat)
  );

const getComparableArea = (property = {}) => {
  const propertyType = property.propertyType;

  if (propertyType === "lot") {
    return Number(property.lotArea || property.landArea || 0);
  }

  return Number(property.constructionArea || property.landArea || property.lotArea || 0);
};

const getPricePerSquareMeter = (property = {}) => {
  const snapshotValue = Number(property.analyticsSnapshot?.pricePerSquareMeter || 0);

  if (Number.isFinite(snapshotValue) && snapshotValue > 0) {
    return snapshotValue;
  }

  const area = getComparableArea(property);
  const price = Number(property.price || 0);

  if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(price) || price <= 0) {
    return 0;
  }

  return price / area;
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
  onPolygonChange,
  pricingMode = "price",
  onPricingModeChange,
  autoFitKey,
  minHeight = 740,
  className
}) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const drawControlsEnabled = process.env.NEXT_PUBLIC_ENABLE_MAP_DRAW === "true";
  const mapStyle = resolveMapStyle(process.env.NEXT_PUBLIC_MAPBOX_STYLE);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const lastAutoFitSignatureRef = useRef("");
  const skipNextMoveEndRef = useRef(false);
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const provinceCode = getProvinceCode(selectedProvince);
  const visibleProperties = safeMapProperties(properties);
  const organicProperties = visibleProperties.filter((property) => !property.featured);
  const boostedProperties = visibleProperties.filter((property) => property.featured);
  const markerProperties = [...organicProperties, ...boostedProperties];
  const visibleContextPoints = safeContextPoints(activeContextLayers);
  const activeContextLayerMeta = mapContextLayers.filter((layer) =>
    activeContextLayers.includes(layer.id)
  );
  const boostLabel = language === "en" ? "Featured" : "Destacada";
  const pricingModeOptions = useMemo(
    () => [
      {
        value: "price",
        label: language === "en" ? "Price" : "Precio"
      },
      {
        value: "ppsm",
        label: language === "en" ? "Price / m2" : "Precio / m2"
      }
    ],
    [language]
  );

  useEffect(() => {
    const loadDistricts = async () => {
      if (!provinceCode) {
        setDistrictGeoJson(null);
        return;
      }

      const response = await fetch(`/geo/districts/${provinceCode}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load districts for ${provinceCode}`);
      }

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

    districtGeoJson.features?.forEach((feature) =>
      collectBounds(feature.geometry?.coordinates, state)
    );

    if (!state.hasPoints) {
      return;
    }

    try {
      skipNextMoveEndRef.current = true;
      mapRef.current.getMap().fitBounds(
        [
          [state.minLng, state.minLat],
          [state.maxLng, state.maxLat]
        ],
        {
          padding: 36,
          duration: 700
        }
      );
    } catch (_error) {
      // Keep the map usable even if the district fit fails.
    }
  }, [districtGeoJson]);

  useEffect(() => {
    if (!focusedContextPoint || !mapRef.current) {
      return;
    }

    if (!Number.isFinite(focusedContextPoint.lng) || !Number.isFinite(focusedContextPoint.lat)) {
      return;
    }

    try {
      skipNextMoveEndRef.current = true;
      mapRef.current.getMap().flyTo({
        center: [focusedContextPoint.lng, focusedContextPoint.lat],
        zoom: 11.6,
        duration: 1000
      });
    } catch (_error) {
      // Ignore flyTo issues and keep the map mounted.
    }
  }, [focusedContextPoint]);

  useEffect(() => {
    if (!mapRef.current || districtGeoJson || focusedContextPoint || !visibleProperties.length) {
      return;
    }

    const propertiesSignature = `${autoFitKey || ""}::${visibleProperties
      .map((property) => `${property._id}:${property.location.coordinates.join(",")}`)
      .join("|")}`;

    if (!propertiesSignature || propertiesSignature === lastAutoFitSignatureRef.current) {
      return;
    }

    const map = mapRef.current.getMap?.();

    if (!map) {
      return;
    }

    try {
      if (visibleProperties.length === 1) {
        skipNextMoveEndRef.current = true;
        map.flyTo({
          center: visibleProperties[0].location.coordinates,
          zoom: 12.6,
          duration: 700
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();

        visibleProperties.forEach((property) => {
          bounds.extend(property.location.coordinates);
        });

        skipNextMoveEndRef.current = true;
        map.fitBounds(bounds, {
          padding: 56,
          duration: 700,
          maxZoom: 12.4
        });
      }

      lastAutoFitSignatureRef.current = propertiesSignature;
    } catch (_error) {
      // Keep the map available even if auto-fit fails for a particular result set.
    }
  }, [autoFitKey, districtGeoJson, focusedContextPoint, visibleProperties]);

  useEffect(() => {
    boostedProperties.forEach((property) => {
      if (!property?._id) {
        return;
      }

      void trackBoostMetricOnce(property._id, boostMetrics.mapImpression, "map");
    });
  }, [boostedProperties]);

  useEffect(() => {
    if (!drawControlsEnabled || !token || !mapRef.current || drawRef.current) {
      return;
    }

    const map = mapRef.current.getMap?.();

    if (!map) {
      return;
    }

    let draw = null;

    const syncPolygon = () => {
      const activeDraw = drawRef.current;

      if (!activeDraw) {
        return;
      }

      const [feature] = activeDraw.getAll().features;
      const polygon = feature?.geometry?.coordinates?.[0] || null;
      onPolygonChange?.(polygon);
    };

    try {
      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });

      drawRef.current = draw;
      map.addControl(draw, "top-left");
      map.on("draw.create", syncPolygon);
      map.on("draw.update", syncPolygon);
      map.on("draw.delete", syncPolygon);
    } catch (_error) {
      drawRef.current = null;
      return;
    }

    return () => {
      map.off("draw.create", syncPolygon);
      map.off("draw.update", syncPolygon);
      map.off("draw.delete", syncPolygon);

      if (!draw) {
        return;
      }

      try {
        map.removeControl(draw);
      } catch (_error) {
        // Ignore cleanup errors.
      }

      if (drawRef.current === draw) {
        drawRef.current = null;
      }
    };
  }, [drawControlsEnabled, token, onPolygonChange]);

  if (!token) {
    return (
      <div className="surface flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
        <h3 className="text-lg font-semibold">{t("map.enableMapboxTitle")}</h3>
        <p className="max-w-md text-sm text-ink/60">{t("map.enableMapboxDescription")}</p>
      </div>
    );
  }

  const getMarkerLabel = (property) => {
    if (pricingMode === "ppsm") {
      const pricePerSquareMeter = getPricePerSquareMeter(property);

      if (pricePerSquareMeter > 0) {
        return `${formatCompactCurrency(pricePerSquareMeter, property.currency)}/m2`;
      }
    }

    return formatCompactCurrency(property.price, property.currency);
  };

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
    <div className={cn("map-stage", className)}>
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
        <div className="surface-soft px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-ink sm:text-sm">
            <MapPinned className="h-4 w-4 shrink-0 text-terracotta" />
            {selectedProvince || "Costa Rica"}
            <span className="text-ink/35">{"\u00b7"}</span>
            {visibleProperties.length} {language === "en" ? "results" : "resultados"}
          </div>
        </div>
        <div className="pointer-events-auto surface-soft inline-flex items-center gap-1 rounded-full p-1 shadow-soft">
          {pricingModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPricingModeChange?.(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                pricingMode === option.value
                  ? "bg-pine text-white shadow-soft"
                  : "text-ink/58 hover:bg-white/78"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapLib={mapboxgl}
        mapStyle={mapStyle}
        initialViewState={mapDefaultCenter}
        interactiveLayerIds={districtGeoJson ? ["district-fills"] : []}
        minZoom={5}
        renderWorldCopies={false}
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
          if (skipNextMoveEndRef.current) {
            skipNextMoveEndRef.current = false;
            return;
          }

          const map = event.target;
          const bounds = map?.getBounds?.();

          if (!bounds || !onBoundsChange) {
            return;
          }

          onBoundsChange({
            south: Number(bounds.getSouth().toFixed(6)),
            west: Number(bounds.getWest().toFixed(6)),
            north: Number(bounds.getNorth().toFixed(6)),
            east: Number(bounds.getEast().toFixed(6))
          });
        }}
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

        {markerProperties.map((property) => {
          const marketStatus = property.marketStatus || "available";
          const markerStyle = markerStylesByStatus[marketStatus] || markerStylesByStatus.available;
          const isBoosted = Boolean(property.featured);

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
                  if (property.slug) {
                    router.push(
                      buildBoostPropertyHref(
                        property.slug,
                        isBoosted ? "map" : "",
                        isBoosted
                      )
                    );
                  }
                }}
                className="group relative -m-2 rounded-full p-2 focus:outline-none"
                aria-label={property.title || "Propiedad"}
              >
                {isBoosted ? (
                  <span className="pointer-events-none absolute inset-x-0 top-2 flex justify-center">
                    <span className="rounded-full border border-[#f8e2b8] bg-[#fff8ea]/96 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8f540d] shadow-[0_10px_24px_rgba(214,146,48,0.22)] backdrop-blur">
                      {boostLabel}
                    </span>
                  </span>
                ) : null}
                {isBoosted ? (
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(241,194,94,0.32)_0%,rgba(241,194,94,0.16)_42%,rgba(241,194,94,0)_74%)] blur-xl" />
                ) : null}
                <span
                  className={cn(
                    "relative inline-flex rounded-full border-2 px-2 py-1.5 text-[10px] font-semibold backdrop-blur transition duration-150 ease-out sm:px-3 sm:py-1.5 sm:text-[11px]",
                    isBoosted
                      ? "gap-1 border-[#ad7420] bg-[linear-gradient(135deg,rgba(255,248,234,0.98),rgba(255,225,169,0.97)_48%,rgba(255,244,222,0.98))] text-[#6e3e00] shadow-[0_18px_42px_rgba(214,146,48,0.28)]"
                      : "shadow-[0_14px_28px_rgba(17,34,54,0.16)]",
                    selectedPropertyId === property._id
                      ? isBoosted
                        ? "scale-[1.12] ring-4 ring-[#f3d291]/70"
                        : `${markerStyle.selected} scale-[1.08]`
                      : isBoosted
                        ? "group-hover:scale-[1.16] group-focus-visible:scale-[1.16]"
                        : `${markerStyle.base} group-hover:scale-[1.13] group-focus-visible:scale-[1.13]`
                  )}
                >
                  {isBoosted ? <Sparkles className="h-3.5 w-3.5 text-[#a55d00]" /> : null}
                  {getMarkerLabel(property)}
                </span>
              </button>
            </Marker>
          );
        })}

        {visibleContextPoints.map((point) => {
          const selected = focusedContextPoint?.id === point.id;

          return (
            <Marker key={point.id} longitude={point.lng} latitude={point.lat} anchor="bottom">
              <button
                type="button"
                onClick={() => onSelectContextPoint?.(point)}
                className={`rounded-full border px-2 py-1.5 text-[9px] font-semibold text-white shadow-soft transition sm:px-2.5 sm:py-1.5 sm:text-[10px] ${
                  selected ? "scale-105 ring-4 ring-white/80" : "opacity-90 hover:opacity-100"
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f24301c] via-transparent to-transparent" />

      {selectedProvince || activeContextLayers.length || boostedProperties.length ? (
        <div className="space-y-2 border-t border-ink/10 bg-white/90 px-3 py-3 text-xs font-medium text-ink/65 sm:px-4">
          {selectedProvince ? (
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 text-terracotta" />
              <span>{t("map.districtsHint", { province: selectedProvince })}</span>
            </div>
          ) : null}
          {boostedProperties.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#f1d9ae] bg-[#fff8ea] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f540d]">
                {boostedProperties.length} {language === "en" ? "featured" : "destacadas"}
              </span>
              <span>
                {language === "en"
                  ? "Featured listings keep a premium bubble and stronger map presence."
                  : "Las destacadas mantienen una burbuja premium y una presencia mas fuerte en el mapa."}
              </span>
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
}
