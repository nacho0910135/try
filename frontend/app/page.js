"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, MapPinned, Search } from "lucide-react";
import { getFeaturedProperties } from "@/lib/api";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CostaRicaProvinceExplorer } from "@/components/map/CostaRicaProvinceExplorer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { costaRicaProvinces } from "@/lib/costa-rica-provinces";
import { formatCurrency, getMainPhoto } from "@/lib/utils";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("San Jose");

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

  const selectedProvinceMeta = costaRicaProvinces.find((item) => item.name === province);
  const featuredForProvince = featured.filter(
    (property) => property.address?.province === province
  );
  const fallbackSrc = "/property-placeholder.svg";

  return (
    <div className="section-pad">
      <section className="app-shell">
        <div className="surface overflow-hidden bg-hero-grid p-6 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div className="max-w-2xl">
              <BrandLogo className="mb-5" />
              <span className="eyebrow">Mapa protagonista</span>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.06] sm:text-5xl">
                Descubre oportunidades desde la geografía, no desde un listado genérico.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink/68">
                Selecciona una provincia, entra al territorio y usa el mapa como la pieza central de exploración para venta, renta y lotes en Costa Rica.
              </p>

              <div className="mt-7 grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                <div className="surface space-y-3 p-4">
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
                      <Select
                        value={province}
                        onChange={(event) => setProvince(event.target.value)}
                      >
                        {costaRicaProvinces.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <Link href={`/search?q=${encodeURIComponent(query)}&province=${encodeURIComponent(province)}`}>
                    <Button className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Explorar en el mapa
                    </Button>
                  </Link>
                </div>
                <div className="surface p-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-ink/40">
                    Provincia activa
                  </div>
                  <div className="mt-2 text-xl font-semibold">{selectedProvinceMeta?.name}</div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {selectedProvinceMeta?.blurb}
                  </p>
                </div>
              </div>
            </div>

            <CostaRicaProvinceExplorer
              selectedProvince={province}
              onSelectProvince={setProvince}
            />
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="surface p-4">
              <MapPinned className="h-5 w-5 text-terracotta" />
              <h3 className="mt-3 text-base font-semibold">Mapa interactivo</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">Bounds, dibujo de zonas y busqueda por coordenadas.</p>
            </div>
            <div className="surface p-4">
              <Compass className="h-5 w-5 text-lagoon" />
              <h3 className="mt-3 text-base font-semibold">Busqueda local</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">Provincia, canton, distrito, barrio y cerca de mi.</p>
            </div>
            <div className="surface p-4">
              <ArrowRight className="h-5 w-5 text-pine" />
              <h3 className="mt-3 text-base font-semibold">Publicacion simple</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">Dashboard para agentes, propietarios y moderacion admin.</p>
            </div>
          </div>

          {featuredForProvince.length ? (
            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {featuredForProvince.slice(0, 2).map((property) => {
                const mainPhoto = getMainPhoto(property);

                return (
                  <Link
                    key={property._id}
                    href={`/properties/${property.slug}`}
                    className="surface grid gap-4 p-4 sm:grid-cols-[180px_1fr]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                      <img
                        src={mainPhoto?.url || fallbackSrc}
                        alt={mainPhoto?.alt || property.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackSrc;
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-terracotta">
                          {province}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold">{property.title}</h3>
                      </div>
                      <div className="text-2xl font-semibold">
                        {formatCurrency(property.price, property.currency)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
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
