"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProperties, getZoneSeoData } from "@/lib/api";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import { costaRicaProvinces } from "@/lib/costa-rica-provinces";
import { useAuthStore } from "@/store/auth-store";

export default function FeaturedListingsPage() {
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : "/login";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [summary, setSummary] = useState(null);
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const copy =
    language === "en"
      ? {
          eyebrow: "Featured",
          title: "Featured listings",
          description:
            "A cleaner way to start exploring. Featured listings appear first, followed by the most recent inventory in the area you want to see.",
          total: "visible now",
          forSale: "for sale",
          forRent: "for rent",
          allCostaRica: "All Costa Rica",
          openSearch: "Open search",
          publish: "Publish property",
          whyTitle: "Smart ordering",
          whyDescription:
            "Featured listings stay first, then the freshest inventory continues below without breaking the browsing flow.",
          emptyTitle: "No listings available right now",
          emptyDescription:
            "Try another province or come back in a moment for a fresher view.",
          retry: "Retry",
          loadError: "Featured listings could not be loaded right now.",
          loadMore: "Load more"
        }
      : {
          eyebrow: "Destacadas",
          title: "Propiedades destacadas",
          description:
            "Una forma mas limpia de explorar. Primero aparecen las propiedades destacadas y luego el inventario mas reciente de la zona que quieras ver.",
          total: "visibles ahora",
          forSale: "en venta",
          forRent: "en renta",
          allCostaRica: "Todo Costa Rica",
          openSearch: "Abrir busqueda",
          publish: "Publicar propiedad",
          whyTitle: "Orden inteligente",
          whyDescription:
            "Las destacadas quedan primero y luego sigue el inventario mas reciente, sin romper el flujo natural de exploracion.",
          emptyTitle: "Todavia no hay propiedades para mostrar",
          emptyDescription:
            "Prueba otra provincia o vuelve en un momento para ver una lectura mas fresca.",
          retry: "Intentar de nuevo",
          loadError: "No se pudieron cargar las propiedades destacadas en este momento.",
          loadMore: "Cargar mas"
        };

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      setLoading(true);

      try {
        const data = await getProperties({
          limit: 24,
          page,
          sort: "recent",
          province: provinceFilter === "all" ? undefined : provinceFilter
        });
        if (cancelled) return;
        setItems((current) => (page === 1 ? data.items || [] : [...current, ...(data.items || [])]));
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        setLoadFailed(false);
      } catch (_error) {
        if (cancelled) return;
        if (page === 1) {
          setItems([]);
          setPagination({ page: 1, totalPages: 1, total: 0 });
        }
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
  }, [page, provinceFilter]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const data = await getZoneSeoData(
          provinceFilter === "all" ? {} : { province: provinceFilter }
        );
        if (cancelled) return;
        setSummary(data.summary || null);
      } catch (_error) {
        if (cancelled) return;
        setSummary(null);
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [provinceFilter]);

  const provinces = useMemo(
    () => [copy.allCostaRica, ...costaRicaProvinces.map((item) => item.name)],
    [copy.allCostaRica]
  );

  const stats = useMemo(() => {
    const saleCount = Number(summary?.saleListings || 0);
    const rentCount = Number(summary?.rentListings || 0);

    return [
      { label: copy.total, value: Number(summary?.totalListings || pagination.total || items.length) },
      { label: copy.forSale, value: saleCount },
      { label: copy.forRent, value: rentCount }
    ];
  }, [copy.forRent, copy.forSale, copy.total, items.length, pagination.total, summary]);

  const hasMore = pagination.page < pagination.totalPages;

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
              <Link href="/search">
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
                onClick={() => {
                  setProvinceFilter(value);
                  setPage(1);
                }}
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
                ? "Loading featured listings..."
                : "Cargando propiedades destacadas..."
            }
          />
        ) : loadFailed ? (
          <EmptyState
            title={copy.loadError}
            description={copy.whyDescription}
            actionLabel={copy.retry}
            onAction={() => window.location.reload()}
          />
        ) : items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {items.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
        )}

        {!loading && !loadFailed && hasMore ? (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => setPage((current) => current + 1)}>
              {copy.loadMore}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
