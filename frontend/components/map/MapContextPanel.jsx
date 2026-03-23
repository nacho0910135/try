"use client";

import { memo, useMemo } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  HeartPulse,
  Home,
  LineChart,
  MapPinned,
  Palmtree
} from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { getMapContextPoint, mapContextLayers } from "@/lib/costa-rica-map-context";
import { Button } from "@/components/ui/Button";

const layerIcons = {
  universities: GraduationCap,
  hospitals: HeartPulse,
  beaches: Palmtree,
  business: BriefcaseBusiness,
  family: Home,
  investment: LineChart
};

const MapContextPanelComponent = function MapContextPanel({
  activeLayerIds = [],
  focusedPointId,
  radiusKm,
  onToggleLayer,
  onFocusPoint,
  onClearFocus
}) {
  const { language } = useLanguage();
  const focusedPoint = useMemo(
    () => (focusedPointId ? getMapContextPoint(focusedPointId) : null),
    [focusedPointId]
  );

  return (
    <div className="surface-elevated space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pine/70">
            {language === "en" ? "Context layers" : "Capas de contexto"}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {language === "en"
              ? "Explore beyond the listing pins"
              : "Explora mas alla de los pines"}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/65">
            {language === "en"
              ? "Activate map layers to discover listings near universities, hospitals, beaches, and work hubs. This makes the map feel like a decision tool, not just a price canvas."
              : "Activa capas para descubrir propiedades cerca de universidades, hospitales, playas y hubs de trabajo. El mapa se vuelve una herramienta de decision, no solo un lienzo de precios."}
          </p>
        </div>
        <div className="stat-chip">
          {language === "en"
            ? `Search radius: ${radiusKm || 8} km`
            : `Radio de busqueda: ${radiusKm || 8} km`}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {mapContextLayers.map((layer) => {
          const Icon = layerIcons[layer.id] || MapPinned;
          const active = activeLayerIds.includes(layer.id);

          return (
            <div
              key={layer.id}
              className={`rounded-[26px] border p-4 shadow-soft transition ${
                active ? "border-pine/20 bg-pine/[0.06]" : "border-white/70 bg-white/[0.96]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-soft"
                    style={{ backgroundColor: layer.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-ink">
                      {language === "en" ? layer.labelEn : layer.labelEs}
                    </div>
                    <div className="text-sm text-ink/60">
                      {language === "en" ? layer.descriptionEn : layer.descriptionEs}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                      {layer.points.length}{" "}
                      {language === "en"
                        ? layer.points.length === 1
                          ? "point"
                          : "points"
                        : layer.points.length === 1
                          ? "punto"
                          : "puntos"}
                    </div>
                  </div>
                </div>
                <Button
                  variant={active ? "success" : "secondary"}
                  onClick={() => onToggleLayer(layer.id)}
                >
                  {active
                    ? language === "en"
                      ? "Visible"
                      : "Visible"
                    : language === "en"
                      ? "Show"
                      : "Mostrar"}
                </Button>
              </div>

              {active ? (
                <div className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1 xl:grid-cols-2">
                  {layer.points.map((point) => {
                    const pointActive = point.id === focusedPointId;

                    return (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => onFocusPoint({ ...point, layerId: layer.id })}
                        className={`rounded-[20px] px-4 py-3 text-left transition ${
                          pointActive
                            ? "bg-white shadow-soft ring-2 ring-pine/20"
                            : "bg-mist/[0.85] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-ink">{point.name}</div>
                            <div className="mt-1 text-xs text-ink/55">
                              {point.district}, {point.canton}
                            </div>
                          </div>
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                            style={{ backgroundColor: layer.color }}
                          >
                            {language === "en" ? "Search nearby" : "Buscar cerca"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-ink/65">
                          {language === "en" ? point.summaryEn : point.summaryEs}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {focusedPoint ? (
        <div className="surface-soft border border-lagoon/15 bg-lagoon/[0.07] p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-lagoon/75">
                {language === "en" ? "Focused point" : "Punto enfocado"}
              </div>
              <div className="mt-2 text-lg font-semibold text-ink">{focusedPoint.name}</div>
              <div className="mt-1 text-sm text-ink/60">
                {focusedPoint.district}, {focusedPoint.canton}, {focusedPoint.province}
              </div>
            </div>
            <Button variant="ghost" onClick={onClearFocus}>
              {language === "en" ? "Clear focus" : "Quitar foco"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const MapContextPanel = memo(MapContextPanelComponent);
