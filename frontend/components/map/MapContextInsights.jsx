"use client";

import { Compass, MapPinned, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageProvider";

export function MapContextInsights({ summary, radiusKm, focusedPoint }) {
  const { language } = useLanguage();

  if (!summary?.layerCounts?.length && !focusedPoint) {
    return null;
  }

  return (
    <div className="surface-elevated space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pine/70">
            {language === "en" ? "Smart zone read" : "Lectura inteligente de zona"}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {language === "en"
              ? "Why these results matter"
              : "Por que estos resultados importan"}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/65">
            {language === "en"
              ? "We highlight how many current listings are near the context layers you activated, so the map helps you understand lifestyle and demand, not just price."
              : "Resaltamos cuantas propiedades actuales estan cerca de las capas que activaste, para que el mapa explique estilo de vida y demanda, no solo precio."}
          </p>
        </div>
        <div className="stat-chip">
          {language === "en"
            ? `Insight radius: ${radiusKm || 8} km`
            : `Radio de lectura: ${radiusKm || 8} km`}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.layerCounts.map((layer) => (
          <div
            key={layer.id}
            className="rounded-[26px] border border-white/70 bg-white/96 p-4 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: layer.color }} />
              <div className="text-sm font-semibold text-ink">
                {language === "en" ? layer.labelEn : layer.labelEs}
              </div>
            </div>
            <div className="mt-3 text-3xl font-semibold text-ink">{layer.count}</div>
            <div className="mt-1 text-sm text-ink/55">
              {language === "en"
                ? "listings near this layer"
                : "propiedades cerca de esta capa"}
            </div>
          </div>
        ))}

        {focusedPoint ? (
          <div className="rounded-[26px] border border-lagoon/15 bg-lagoon/7 p-4 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
              <Compass className="h-4 w-4" />
              {language === "en" ? "Focused point" : "Punto enfocado"}
            </div>
            <div className="mt-3 text-lg font-semibold text-ink">{focusedPoint.name}</div>
            <div className="mt-1 text-sm text-ink/60">
              {focusedPoint.district}, {focusedPoint.canton}
            </div>
            <div className="mt-3 text-sm text-ink/65">
              {language === "en" ? focusedPoint.summaryEn : focusedPoint.summaryEs}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[26px] border border-white/70 bg-white/96 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MapPinned className="h-4 w-4 text-pine" />
            {language === "en" ? "Top districts in this view" : "Distritos mas fuertes en esta vista"}
          </div>
          {summary.topDistricts.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.topDistricts.map((district) => (
                <span
                  key={district.label}
                  className="rounded-full bg-pine/10 px-3 py-1.5 text-xs font-semibold text-pine shadow-soft"
                >
                  {`${district.label} - ${district.count}`}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/55">
              {language === "en"
                ? "Activate layers or move the map to reveal zone patterns."
                : "Activa capas o mueve el mapa para revelar patrones de zona."}
            </p>
          )}
        </div>

        <div className="rounded-[26px] border border-amber-200 bg-amber-50 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <Sparkles className="h-4 w-4" />
            {language === "en" ? "Closest context signal" : "Senal de contexto mas cercana"}
          </div>
          {summary.strongestMatch ? (
            <>
              <div className="mt-3 text-lg font-semibold text-ink">
                {summary.strongestMatch.propertyTitle}
              </div>
              <div className="mt-1 text-sm text-ink/65">
                {language === "en"
                  ? `Near ${summary.strongestMatch.name}`
                  : `Cerca de ${summary.strongestMatch.name}`}
              </div>
              <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-700">
                {summary.strongestMatch.distanceKm.toFixed(1)} km
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink/55">
              {language === "en"
                ? "No close context match yet in the current result set."
                : "Todavia no hay una coincidencia cercana dentro del set actual."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
