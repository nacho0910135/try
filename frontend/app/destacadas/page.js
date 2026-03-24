"use client";

import Link from "next/link";
import { ArrowRight, MapPinned, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProperties } from "@/lib/api";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import { useAuthStore } from "@/store/auth-store";

const normalizeProvinceName = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function FeaturedListingsPage() {
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : "/login";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState("all");

  const copy =
    language === "en"
      ? {
          eyebrow: "Boost showcase",
          title: "Listings with extra visibility",
          description:
            "This is the premium showcase for listings that paid for boost. They stay ahead of organic inventory and stand out harder inside the marketplace.",
          total: "boosted now",
          forSale: "for sale",
          forRent: "for rent",
          allCostaRica: "All Costa Rica",
          openSearch: "Open boosted search",
          publish: "Publish and boost",
          whyTitle: "Where boost gets seen",
          whyDescription:
            "Homepage showcase, search rail before the organic grid, and premium map price bubbles.",
          emptyTitle: "No boosted listings yet",
          emptyDescription:
            "As soon as a listing activates boost, it will appear here with priority visibility.",
          retry: "Retry",
          loadError: "Boosted listings could not be loaded right now."
        }
      : {
          eyebrow: "Vitrina boost",
          title: "Propiedades con visibilidad extra",
          description:
            "Aqui vive la vitrina premium de las publicaciones que pagaron boost. Se muestran antes del inventario organico y resaltan mas fuerte dentro del marketplace.",
          total: "con boost ahora",
          forSale: "en venta",
          forRent: "en renta",
          allCostaRica: "Todo Costa Rica",
          openSearch: "Abrir busqueda con boost",
          publish: "Publicar y destacar",
          whyTitle: "Donde se ve el boost",
          whyDescription:
            "Portada, rail de busqueda antes del bloque organico y burbujas premium dentro del mapa.",
          emptyTitle: "Todavia no hay publicaciones con boost",
          emptyDescription:
            "En cuanto una propiedad active boost, aparecera aqui con prioridad de visibilidad.",
          retry: "Intentar de nuevo",
          loadError: "No se pudieron cargar las publicaciones con boost en este momento."
        };

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      setLoading(true);

      try {
        const data = await getProperties({ featured: true, limit: 48, page: 1, sort: "recent" });
        if (cancelled) return;
        setItems(data.items || []);
        setLoadFailed(false);
      } catch (_error) {
        if (cancelled) return;
        setItems([]);
        setLoadFailed(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const provinces = useMemo(() => {
    const unique = new Map();

    items.forEach((item) => {
      if (item?.address?.province) {
        unique.set(normalizeProvinceName(item.address.province), item.address.province);
      }
    });

    return [copy.allCostaRica, ...Array.from(unique.values())];
  }, [copy.allCostaRica, items]);

  const visibleItems = useMemo(() => {
    if (provinceFilter === "all") {
      return items;
    }

    return items.filter(
      (item) =>
        normalizeProvinceName(item.address?.province) === normalizeProvinceName(provinceFilter)
    );
  }, [items, provinceFilter]);

  const stats = useMemo(() => {
    const saleCount = items.filter((item) => item.businessType === "sale").length;
    const rentCount = items.filter((item) => item.businessType === "rent").length;

    return [
      { label: copy.total, value: items.length },
      { label: copy.forSale, value: saleCount },
      { label: copy.forRent, value: rentCount }
    ];
  }, [copy.forRent, copy.forSale, copy.total, items]);

  return (
    <div className="section-pad">
      <section className="app-shell">
        <div className="surface-elevated overflow-hidden border border-[#f0dab4] bg-[linear-gradient(135deg,rgba(255,248,234,0.98),rgba(255,238,208,0.98)_42%,rgba(255,247,232,0.98))] px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <span className="eyebrow text-[#8f540d]">{copy.eyebrow}</span>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/66 sm:text-[15px]">
                {copy.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/search?featured=true">
                <Button variant="accent">
                  {copy.openSearch}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={publishHref}>
                <Button variant="secondary">{copy.publish}</Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="surface-soft p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#8f540d]">
                <Sparkles className="h-4 w-4" />
                {copy.whyTitle}
              </div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-ink/62">{copy.whyDescription}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#eccb8e] bg-white/82 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f540d] shadow-soft">
                <MapPinned className="h-3.5 w-3.5" />
                Boost
              </div>
            </div>

            <div className="surface-soft grid gap-3 p-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-ink">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="app-shell mt-10 space-y-5 sm:mt-14">
        <div className="flex flex-wrap gap-2.5">
          {provinces.map((item) => {
            const value = item === copy.allCostaRica ? "all" : item;
            const active = value === provinceFilter;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setProvinceFilter(value)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-[#eccb8e] bg-[#fff4dc] text-[#8f540d] shadow-soft"
                    : "border-white/80 bg-white/82 text-ink/64 hover:border-[#eccb8e] hover:text-[#8f540d]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {loading ? (
          <LoadingState
            label={
              language === "en"
                ? "Loading boosted listings..."
                : "Cargando publicaciones con boost..."
            }
          />
        ) : loadFailed ? (
          <EmptyState
            title={copy.loadError}
            description={copy.whyDescription}
            actionLabel={copy.retry}
            onAction={() => window.location.reload()}
          />
        ) : visibleItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {visibleItems.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
        )}
      </section>
    </div>
  );
}
