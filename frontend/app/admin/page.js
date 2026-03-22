"use client";

import { useEffect, useState } from "react";
import { getAdminAnalyticsOverview } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await getAdminAnalyticsOverview();
      setAnalytics(data.analytics);
    };

    loadMetrics();
  }, []);

  if (!analytics) {
    return <LoadingState label="Cargando metricas..." />;
  }

  return (
    <>
      <section className="surface bg-hero-grid p-8">
        <span className="eyebrow">Administracion</span>
        <h1 className="mt-4 font-serif text-5xl font-semibold">Control del marketplace</h1>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(analytics.summary).map(([key, value]) => (
          <div key={key} className="surface p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-ink/40">{key}</div>
            <div className="mt-4 text-4xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Precio promedio por provincia</h2>
          <div className="mt-5 space-y-3">
            {analytics.priceByProvince.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white p-4">
                <span className="font-medium">{item.label}</span>
                <span className="text-sm text-ink/65">{item.averagePpsm} / m²</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Ranking de liquidez</h2>
          <div className="mt-5 space-y-3">
            {analytics.liquidityRanking.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white p-4">
                <div className="font-medium">{item.label}</div>
                <div className="mt-2 text-sm text-ink/60">
                  cierres: {item.closedCount} • activas: {item.activeCount} • dias promedio:{" "}
                  {item.averageDaysOnMarket ?? "n/d"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Zonas con mayor demanda</h2>
          <div className="mt-5 space-y-3">
            {analytics.topDemandZones.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white p-4">
                <div className="font-medium">{item.label}</div>
                <div className="mt-2 text-sm text-ink/60">
                  demanda: {item.demandSignal} • promedio: {item.averagePpsm} / m²
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Evolucion de precios</h2>
          <div className="mt-5 space-y-3">
            {analytics.priceEvolution.map((item) => (
              <div key={item.month} className="rounded-2xl bg-white p-4">
                <div className="font-medium">{item.month}</div>
                <div className="mt-2 text-sm text-ink/60">
                  final promedio: {item.averageFinalPrice} • promedio m²: {item.averagePpsm}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
