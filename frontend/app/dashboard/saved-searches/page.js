"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteSavedSearch, getSavedSearches } from "@/lib/api";
import { serializePropertyQuery } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardSavedSearchesPage() {
  const [items, setItems] = useState(null);

  const loadSavedSearches = async () => {
    const data = await getSavedSearches();
    setItems(data.items || []);
  };

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const handleDelete = async (searchId) => {
    await deleteSavedSearch(searchId);
    await loadSavedSearches();
  };

  if (!items) {
    return <LoadingState label="Cargando busquedas guardadas..." />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No tienes busquedas guardadas"
        description="Ve a Explorar, ajusta filtros o dibuja una zona en el mapa y guardala desde arriba."
      />
    );
  }

  return (
    <section className="surface p-6">
      <span className="eyebrow">Seguimiento</span>
      <h1 className="mt-4 font-serif text-4xl font-semibold">Busquedas guardadas</h1>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{item.name}</div>
                <p className="mt-2 text-sm text-ink/55">
                  {Object.entries(item.filters || {})
                    .filter(([, value]) => value !== null && value !== undefined && value !== "")
                    .map(([key, value]) => `${key}: ${typeof value === "object" ? "mapa" : value}`)
                    .join(" • ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/search?${serializePropertyQuery(item.filters || {})}`}>
                  <Button variant="secondary">Abrir</Button>
                </Link>
                <Button variant="ghost" onClick={() => handleDelete(item._id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
