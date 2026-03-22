"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinned, Sparkles } from "lucide-react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { costaRicaProvinces } from "@/lib/costa-rica-provinces";
import { getProvinceByName } from "@/lib/costa-rica-geo";
import { mapDefaultCenter } from "@/lib/constants";

export function CostaRicaProvinceExplorer({ selectedProvince, onSelectProvince }) {
  const router = useRouter();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/light-v11";
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

  if (!token) {
    return (
      <div className="surface p-6 text-sm text-ink/65">
        Activa `NEXT_PUBLIC_MAPBOX_TOKEN` para ver las provincias interactivas con tus GeoJSON.
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

  return (
    <div className="surface overflow-hidden p-4">
      <div className="overflow-hidden rounded-[30px] border border-white/80 bg-[#c3e6f0] shadow-soft">
        <div className="border-b border-white/60 bg-white/55 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-lagoon/75">
                Atlas interactivo
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">Costa Rica por provincia</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-ink/70">
              <MapPinned className="h-4 w-4 text-terracotta" />
              Toca una provincia para explorarla
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_24%_28%,rgba(255,255,255,0.45),transparent_18%),radial-gradient(circle_at_76%_22%,rgba(255,255,255,0.3),transparent_16%),linear-gradient(180deg,#a5d9e8_0%,#9ed2e3_48%,#98cfe0_100%)] px-4 pb-4 pt-2">
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
              initialViewState={{ ...mapDefaultCenter, zoom: 6.15 }}
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

                const provinceName = provinceFeature.properties.name;
                onSelectProvince?.(provinceName);
                router.push(`/search?province=${encodeURIComponent(provinceName)}`);
              }}
              style={{ width: "100%", minHeight: 640 }}
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

          <div className="relative z-10 mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="rounded-[26px] bg-white/80 px-5 py-4 shadow-soft backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon/75">
                Provincia activa
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-semibold text-ink">{focusProvince.name}</h3>
                <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink/70">
                  <Sparkles className="h-3.5 w-3.5 text-terracotta" />
                  Exploracion visual
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/68">{focusProvince.blurb}</p>
              <p className="mt-2 text-sm font-medium text-ink/55">{focusProvince.spotlight}</p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {costaRicaProvinces.map((province) => {
                const active = province.name === focusProvince.name;

                return (
                  <button
                    key={province.name}
                    type="button"
                    onClick={() => {
                      onSelectProvince?.(province.name);
                      router.push(`/search?province=${encodeURIComponent(province.name)}`);
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
        </div>
      </div>
    </div>
  );
}
