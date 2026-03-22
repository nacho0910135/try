"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, SearchCheck } from "lucide-react";
import { getDashboardSummary } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      const data = await getDashboardSummary();
      setSummary(data.summary);
    };

    loadSummary();
  }, []);

  if (!summary) {
    return <LoadingState label="Cargando dashboard..." />;
  }

  const cards = [
    { label: "Mis propiedades", value: summary.properties, href: "/dashboard/properties" },
    { label: "Leads recibidos", value: summary.leadsReceived, href: "/dashboard/leads" },
    { label: "Favoritos", value: summary.favorites, href: "/favorites" },
    { label: "Busquedas guardadas", value: summary.savedSearches, href: "/dashboard/saved-searches" }
  ];

  return (
    <>
      <section className="surface bg-hero-grid p-8">
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">
          Hola, {user?.name?.split(" ")[0] || "equipo"}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink/65">
          Desde aqui puedes crear propiedades, responder leads y revisar el estado de tu operacion.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="surface p-6 transition hover:-translate-y-1">
            <div className="text-sm uppercase tracking-[0.18em] text-ink/40">{card.label}</div>
            <div className="mt-4 text-4xl font-semibold">{card.value}</div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
              Ver detalle
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="surface p-6">
          <Heart className="h-5 w-5 text-terracotta" />
          <h2 className="mt-4 text-2xl font-semibold">Mantente cerca del mercado</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            Guarda las zonas y filtros que mas te importan para volver rapido a los mismos resultados.
          </p>
        </div>
        <div className="surface p-6">
          <SearchCheck className="h-5 w-5 text-lagoon" />
          <h2 className="mt-4 text-2xl font-semibold">Optimiza tus publicaciones</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            Agrega coordenadas precisas, varias fotos y descripciones detalladas para destacar en el mapa y en el listado.
          </p>
        </div>
      </section>
    </>
  );
}

