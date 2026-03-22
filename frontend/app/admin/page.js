"use client";

import { useEffect, useState } from "react";
import { getAdminMetrics } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await getAdminMetrics();
      setMetrics(data.metrics);
    };

    loadMetrics();
  }, []);

  if (!metrics) {
    return <LoadingState label="Cargando metricas..." />;
  }

  return (
    <>
      <section className="surface bg-hero-grid p-8">
        <span className="eyebrow">Administracion</span>
        <h1 className="mt-4 font-serif text-5xl font-semibold">Control del marketplace</h1>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="surface p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-ink/40">{key}</div>
            <div className="mt-4 text-4xl font-semibold">{value}</div>
          </div>
        ))}
      </section>
    </>
  );
}

