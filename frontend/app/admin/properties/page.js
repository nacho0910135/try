"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAdminProperties,
  getAdminPropertyIntelligence,
  moderateAdminProperty
} from "@/lib/api";
import {
  formatCurrency,
  formatMarketStatus,
  formatPropertyStatus
} from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";

const scoreLabels = {
  "below-market": "Debajo del mercado",
  "in-range": "En rango",
  "above-market": "Por encima del mercado"
};

const moderationLabels = {
  clean: { label: "Limpia", className: "text-pine" },
  watch: { label: "Observar", className: "text-terracotta" },
  review: { label: "Revisar", className: "text-red-600" }
};

const formatFlagLabel = (value = "") =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  const loadProperties = async () => {
    const data = await getAdminProperties();
    setProperties(data.items || []);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleModeration = async (propertyId, payload) => {
    await moderateAdminProperty(propertyId, payload);
    await loadProperties();
  };

  const handleAnalyze = async (propertyId) => {
    const data = await getAdminPropertyIntelligence(propertyId);
    setIntelligence(data.intelligence);
  };

  if (!properties) {
    return <LoadingState label="Cargando propiedades..." />;
  }

  return (
    <section className="surface p-6">
      <span className="eyebrow">Moderacion</span>
      <h1 className="mt-4 font-serif text-4xl font-semibold">Gestion de propiedades</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{property.title}</div>
                  <div className="text-sm text-ink/55">
                    {property.owner?.name} - {formatCurrency(property.price, property.currency)} -{" "}
                    {formatPropertyStatus(property.status)} - {formatMarketStatus(property.marketStatus)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span
                      className={
                        moderationLabels[property.moderationSignals?.reviewStatus || "clean"].className
                      }
                    >
                      {moderationLabels[property.moderationSignals?.reviewStatus || "clean"].label}
                    </span>
                    {property.moderationSignals?.duplicateCandidateCount ? (
                      <span className="text-terracotta">
                        {property.moderationSignals.duplicateCandidateCount} posible(s) duplicado(s)
                      </span>
                    ) : null}
                    {property.moderationSignals?.suspiciousFlags?.length ? (
                      <span className="text-ink/55">
                        {property.moderationSignals.suspiciousFlags
                          .slice(0, 3)
                          .map(formatFlagLabel)
                          .join(", ")}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={property.featured ? "secondary" : "ghost"}
                    onClick={() =>
                      handleModeration(property._id, {
                        featured: !property.featured
                      })
                    }
                  >
                    {property.featured ? "Quitar destacada" : "Destacar"}
                  </Button>
                  <Button variant="secondary" onClick={() => handleAnalyze(property._id)}>
                    Analizar
                  </Button>
                  <select
                    value={property.status}
                    onChange={(event) =>
                      handleModeration(property._id, { status: event.target.value })
                    }
                    className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  >
                    {["draft", "published", "paused", "sold", "rented"].map((status) => (
                      <option key={status} value={status}>
                        {formatPropertyStatus(status)}
                      </option>
                    ))}
                  </select>
                  {property.status === "published" ? (
                    <span className="inline-flex items-center rounded-full bg-pine/10 px-3 py-2 text-xs font-semibold text-pine">
                      Publicada automaticamente
                    </span>
                  ) : null}
                  <Link href={`/properties/${property.slug}`}>
                    <Button variant="ghost">Ver</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="surface p-6">
          <h2 className="text-2xl font-semibold">Inteligencia de propiedad</h2>
          {intelligence ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-[24px] bg-mist p-4">
                <div className="text-sm uppercase tracking-[0.18em] text-ink/45">
                  Scoring
                </div>
                <div className="mt-2 text-xl font-semibold">
                  {scoreLabels[intelligence.valuation.marketScore] || intelligence.valuation.marketScore}
                </div>
                <div className="mt-2 text-sm text-ink/60">
                  {intelligence.valuation.pricePerSquareMeter} / m2 vs comps{" "}
                  {intelligence.valuation.comparableAveragePpsm} / m2
                </div>
                <div className="mt-2 text-sm text-ink/60">
                  Rango sugerido:{" "}
                  {formatCurrency(
                    intelligence.valuation.suggestedPriceMin,
                    intelligence.property.currency
                  )}{" "}
                  -{" "}
                  {formatCurrency(
                    intelligence.valuation.suggestedPriceMax,
                    intelligence.property.currency
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-ink/45">
                  Cierres cercanos
                </div>
                <div className="mt-3 space-y-3">
                  {intelligence.recentNearbyClosings.map((item) => (
                    <div key={item._id} className="rounded-2xl bg-white p-4">
                      <div className="font-medium">{item.title}</div>
                      <div className="mt-2 text-sm text-ink/60">
                        {item.distanceKm} km - {item.pricePerSquareMeter} / m2
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-ink/45">
                  Comparables
                </div>
                <div className="mt-3 space-y-3">
                  {intelligence.comparables.slice(0, 5).map((item) => (
                    <div key={item._id} className="rounded-2xl bg-white p-4">
                      <div className="font-medium">{item.title}</div>
                      <div className="mt-2 text-sm text-ink/60">
                        score: {item.similarityScore} - {item.distanceKm} km - {item.pricePerSquareMeter} / m2
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-ink/55">
              Elige una propiedad y pulsa Analizar para ver comparables, ventas cercanas y scoring.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
