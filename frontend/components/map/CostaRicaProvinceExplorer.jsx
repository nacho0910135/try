"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinned, Sparkles } from "lucide-react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { costaRicaProvinces } from "@/lib/costa-rica-provinces";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { getProvinceByName } from "@/lib/costa-rica-geo";
import { mapDefaultCenter } from "@/lib/constants";
import { resolveMapStyle } from "@/lib/map-style";

const getGeoJsonBounds = (featureCollection) => {
  if (!featureCollection?.features?.length) {
    return null;
  }

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const walkCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates)) {
      return;
    }

    if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
      const [lng, lat] = coordinates;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
      return;
    }

    coordinates.forEach(walkCoordinates);
  };

  featureCollection.features.forEach((feature) => {
    walkCoordinates(feature.geometry?.coordinates);
  });

  if ([minLng, minLat, maxLng, maxLat].some((value) => !Number.isFinite(value))) {
    return null;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
};

export function CostaRicaProvinceExplorer({
  selectedProvince,
  onSelectProvince,
  compact = false,
  navigateOnSelect = true
}) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = resolveMapStyle(process.env.NEXT_PUBLIC_MAPBOX_STYLE);
  const mapRef = useRef(null);
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [provinceGeoJson, setProvinceGeoJson] = useState(null);

  const focusProvinceName = hoveredProvince || selectedProvince || "San Jose";
  const focusProvince = useMemo(
    () =>
      getProvinceByName(focusProvinceName) ||
      costaRicaProvinces[0],
    [focusProvinceName]
  );
  const interactiveProvinceGeoJson = useMemo(() => {
    if (!provinceGeoJson) {
      return null;
    }

    return {
      ...provinceGeoJson,
      features: provinceGeoJson.features.map((feature) => {
        const province = getProvinceByName(feature.properties?.name) || costaRicaProvinces[0];

        return {
          ...feature,
          properties: {
            ...feature.properties,
            fill: province.fill,
            activeFill: province.activeFill,
            stroke: province.stroke
          }
        };
      })
    };
  }, [provinceGeoJson]);

  useEffect(() => {
    const loadGeoJson = async () => {
      const response = await fetch("/geo/cr-provinces.json");
      const data = await response.json();
      setProvinceGeoJson(data);
    };

    loadGeoJson().catch(() => {
      setProvinceGeoJson(null);
    });
  }, []);

  useEffect(() => {
    if (!provinceGeoJson || !mapRef.current) {
      return;
    }

    const bounds = getGeoJsonBounds(provinceGeoJson);

    if (!bounds) {
      return;
    }

    const map = mapRef.current.getMap?.();

    if (!map) {
      return;
    }

    map.fitBounds(bounds, {
      padding: { top: 36, right: 36, bottom: 36, left: 36 },
      duration: 1100,
      maxZoom: 7.45
    });
  }, [provinceGeoJson]);

  if (!token) {
    return (
        <div className="surface p-6 text-sm text-ink/65">
          {t("provinceExplorer.enableMapbox")}
        </div>
      );
  }

  const provinceFillLayer = {
    id: "province-fills",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "name"], focusProvince.name],
        ["get", "activeFill"],
        ["get", "fill"]
      ],
      "fill-opacity": [
        "case",
        ["==", ["get", "name"], focusProvince.name],
        0.8,
        0.56
      ]
    }
  };

  const provinceLineLayer = {
    id: "province-lines",
    type: "line",
    paint: {
      "line-color": "#ffffff",
      "line-width": [
        "case",
        ["==", ["get", "name"], focusProvince.name],
        3.2,
        2.1
      ],
      "line-opacity": 0.95
    }
  };

  const handleProvinceSelection = (provinceName) => {
    onSelectProvince?.(provinceName);

    if (navigateOnSelect) {
      router.push(`/search?province=${encodeURIComponent(provinceName)}`);
    }
  };

  return (
    <div className={`surface overflow-hidden ${compact ? "p-0" : "p-3"}`}>
      <div className="overflow-hidden rounded-[30px] border border-white/80 bg-[#c3e6f0] shadow-soft">
        <div
          className={`border-b border-white/60 bg-white/55 backdrop-blur ${
            compact ? "px-3 py-2" : "px-4 py-3"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {compact ? (
                <>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-lagoon/75">
                    {language === "en" ? "Quick province switcher" : "Cambio rapido de provincia"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-ink sm:text-base">
                    {selectedProvince || (language === "en" ? "Costa Rica provinces" : "Provincias de Costa Rica")}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-lagoon/75">
                    {t("provinceExplorer.atlas")}
                  </div>
                  <div className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
                    {t("provinceExplorer.title")}
                  </div>
                </>
              )}
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-white/80 font-semibold text-ink/70 ${
                compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px] sm:text-xs"
              }`}
            >
              <MapPinned className="h-4 w-4 text-terracotta" />
              {compact
                ? language === "en"
                  ? "Tap and filter"
                  : "Toca y filtra"
                : t("provinceExplorer.tapProvince")}
            </div>
          </div>
        </div>

        <div
          className={`relative overflow-hidden bg-[radial-gradient(circle_at_24%_28%,rgba(255,255,255,0.45),transparent_18%),radial-gradient(circle_at_76%_22%,rgba(255,255,255,0.3),transparent_16%),linear-gradient(180deg,#a5d9e8_0%,#9ed2e3_48%,#98cfe0_100%)] ${
            compact ? "px-2 pb-2 pt-2" : "px-3 pb-3 pt-2"
          }`}
        >
          <div className="absolute inset-0 opacity-60">
            <div className="absolute inset-x-12 top-5 h-16 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -left-10 bottom-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-0 top-28 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 overflow-hidden rounded-[28px] border border-white/60">
            <Map
              ref={mapRef}
              mapboxAccessToken={token}
              mapLib={mapboxgl}
              mapStyle={mapStyle}
              initialViewState={{ ...mapDefaultCenter, zoom: 7.1 }}
              interactiveLayerIds={["province-fills"]}
              minZoom={5.7}
              maxZoom={8.5}
              attributionControl={false}
              onMouseMove={(event) => {
                const provinceFeature = event.features?.find(
                  (feature) => feature.layer.id === "province-fills"
                );

                setHoveredProvince(provinceFeature?.properties?.name || null);
              }}
              onMouseLeave={() => setHoveredProvince(null)}
              onClick={(event) => {
                const provinceFeature = event.features?.find(
                  (feature) => feature.layer.id === "province-fills"
                );

                if (!provinceFeature?.properties?.name) {
                  return;
                }

                handleProvinceSelection(provinceFeature.properties.name);
              }}
              style={{ width: "100%", minHeight: compact ? 220 : 760 }}
            >
              <NavigationControl position="top-right" />
              {interactiveProvinceGeoJson ? (
                <Source id="cr-provinces" type="geojson" data={interactiveProvinceGeoJson}>
                  <Layer {...provinceFillLayer} />
                  <Layer {...provinceLineLayer} />
                </Source>
              ) : null}
            </Map>
          </div>

          {compact ? (
            <div className="relative z-10 mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[22px] bg-white/78 px-3 py-2 shadow-soft backdrop-blur">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lagoon/75">
                  {t("provinceExplorer.activeProvince")}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink">{focusProvince.name}</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-mist px-2.5 py-1 text-[10px] font-semibold text-ink/70">
                <Sparkles className="h-3.5 w-3.5 text-terracotta" />
                {language === "en" ? "Updates the price map" : "Actualiza el mapa de precios"}
              </span>
            </div>
          ) : (
            <div className="relative z-10 mt-3 grid gap-3 lg:grid-cols-[1.15fr_auto] lg:items-end">
              <div className="rounded-[26px] bg-white/80 px-4 py-3 shadow-soft backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon/75">
                  {t("provinceExplorer.activeProvince")}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-ink sm:text-2xl">{focusProvince.name}</h3>
                  <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink/70">
                    <Sparkles className="h-3.5 w-3.5 text-terracotta" />
                    {t("provinceExplorer.visualExploration")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/68">
                  {language === "en" ? focusProvince.blurbEn || focusProvince.blurb : focusProvince.blurb}
                </p>
                <p className="mt-1.5 text-sm font-medium text-ink/55">
                  {language === "en"
                    ? focusProvince.spotlightEn || focusProvince.spotlight
                    : focusProvince.spotlight}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {costaRicaProvinces.map((province) => {
                  const active = province.name === focusProvince.name;

                  return (
                    <button
                      key={province.name}
                      type="button"
                      onClick={() => {
                        handleProvinceSelection(province.name);
                      }}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-white bg-white text-ink shadow-soft"
                          : "border-white/60 bg-white/45 text-ink/70 hover:bg-white/75"
                      }`}
                    >
                      {province.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
