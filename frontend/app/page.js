"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, MapPinned, Search } from "lucide-react";
import { getFeaturedProperties } from "@/lib/api";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await getFeaturedProperties();
        setFeatured(data.items || []);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="section-pad">
      <section className="app-shell">
        <div className="surface overflow-hidden bg-hero-grid p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <span className="eyebrow">Explora Costa Rica</span>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl">
                Encuentra propiedades con mapa, GPS y filtros pensados para el mercado local.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-ink/70">
                Venta, renta y lotes en zonas como Escazu, Santa Ana, Heredia, Cartago,
                Tamarindo, Jaco, Liberia y Nosara.
              </p>
            </div>

            <div className="surface space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Busca por zona o estilo</label>
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ejemplo: Escazu, playa, lote..."
                  />
                </div>
                <div>
                  <label className="field-label">Provincia</label>
                  <Input
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                    placeholder="San Jose"
                  />
                </div>
              </div>
              <Link href={`/search?q=${encodeURIComponent(query)}&province=${encodeURIComponent(province)}`}>
                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Empezar a explorar
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="surface p-5">
              <MapPinned className="h-6 w-6 text-terracotta" />
              <h3 className="mt-4 text-lg font-semibold">Mapa interactivo</h3>
              <p className="mt-2 text-sm text-ink/60">Bounds, dibujo de zonas y busqueda por coordenadas.</p>
            </div>
            <div className="surface p-5">
              <Compass className="h-6 w-6 text-lagoon" />
              <h3 className="mt-4 text-lg font-semibold">Busqueda local</h3>
              <p className="mt-2 text-sm text-ink/60">Provincia, canton, distrito, barrio y cerca de mi.</p>
            </div>
            <div className="surface p-5">
              <ArrowRight className="h-6 w-6 text-pine" />
              <h3 className="mt-4 text-lg font-semibold">Publicacion simple</h3>
              <p className="mt-2 text-sm text-ink/60">Dashboard para agentes, propietarios y moderacion admin.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="app-shell mt-14 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Destacadas</span>
            <h2 className="mt-4 font-serif text-4xl font-semibold">Propiedades para empezar</h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-lagoon">
            Ver todas las propiedades
          </Link>
        </div>

        {loading ? (
          <LoadingState label="Cargando propiedades destacadas..." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

