"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight, BrainCircuit, MapPinned, Radar, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProperties, getZoneSeoData } from "@/lib/api";
import { buildBoostPropertyHref, boostMetrics, trackBoostMetricOnce } from "@/lib/boost-metrics";
import { slugifyLocation } from "@/lib/zone-seo";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { MapLoadingShell } from "@/components/map/MapLoadingShell";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import { formatCurrency, getMainPhoto } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const CostaRicaProvinceExplorer = dynamic(
  () =>
    import("@/components/map/CostaRicaProvinceExplorer").then((module) => ({
      default: module.CostaRicaProvinceExplorer
    })),
  {
    ssr: false,
    loading: () => <MapLoadingShell minHeight={560} label="Cargando atlas de Costa Rica..." />
  }
);

const normalizeProvinceName = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function HomePage() {
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoadFailed, setFeaturedLoadFailed] = useState(false);
  const [marketSummary, setMarketSummary] = useState(null);
  const [marketSummaryLoading, setMarketSummaryLoading] = useState(true);
  const [marketSummaryFailed, setMarketSummaryFailed] = useState(false);
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [provinceSummaryCache, setProvinceSummaryCache] = useState({});
  const [hasSuggestedProvince, setHasSuggestedProvince] = useState(false);
  const [province, setProvince] = useState("San Jose");
  const fallbackSrc = "/property-placeholder.svg";
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : "/login";
  const previewProvince = hoveredProvince || province;
  const provincePath = `/zona/${slugifyLocation(previewProvince)}`;
  const provinceSummaryKey = normalizeProvinceName(previewProvince);
  const provinceSummaryEntry = provinceSummaryCache[provinceSummaryKey];
  const provinceSummary = provinceSummaryEntry?.summary || null;
  const provinceSummaryLoading = provinceSummaryEntry?.status === "loading";
  const provinceSummaryFailed = provinceSummaryEntry?.status === "error";

  const copy =
    language === "en"
      ? {
          eyebrow: "Costa Rica, less noise",
          title: "Map, radar, and listings that actually help you decide.",
          description:
            "Search by province, compare faster, and publish with cleaner data from day one.",
          explore: "Open the map",
          publish: "Publish a listing",
          selectedProvince: "Active province",
          focusProvince: "Province in focus",
          radarTitle: "Live read",
          radarDescription: "A quick view of the active inventory and featured sample in this province.",
          hoverHint: "Move across the map to preview another province instantly.",
          activeNow: "active now",
          forSale: "for sale",
          forRent: "for rent",
          utilityEyebrow: "Useful by design",
          utilityTitle: "A marketplace built around signals, not clutter.",
          utilityCards: [
            {
              title: "Map-first search",
              description: "Province, canton, district, GPS, polygon, and live filters.",
              href: "/search"
            },
            {
              title: "Decision layer",
              description: "Compare favorites, inspect momentum, and ask sharper questions.",
              href: "/analysis"
            },
            {
              title: "Trusted publishing",
              description: "Clean inventory, boosts, lead flow, and commercial control.",
              href: publishHref
            }
          ],
          featuredEyebrow: "Featured",
          featuredTitle: "Featured listings",
          featuredDescription:
            "A cleaner way to start exploring. Featured listings appear first and then the freshest inventory continues right behind them.",
          featuredCta: "Open featured",
          featuredSearch: "Open search",
          featuredFailed: "Featured listings could not be loaded right now.",
          noProvinceData: "There is no visible sample for this province yet. Open the map and explore wider."
        }
      : {
          eyebrow: "Costa Rica, sin ruido",
          title: "Mapa, radar y listings que si ayudan a decidir.",
          description:
            "Explora por provincia, compara mas rapido y publica con datos mas limpios desde el primer minuto.",
          explore: "Abrir mapa",
          publish: "Publicar propiedad",
          selectedProvince: "Provincia activa",
          focusProvince: "Provincia en foco",
          radarTitle: "Lectura en vivo",
          radarDescription: "Una vista rapida del inventario activo y la muestra destacada de esta provincia.",
          hoverHint: "Pasa el cursor por el mapa para cambiar esta lectura al instante.",
          activeNow: "activas ahora",
          forSale: "en venta",
          forRent: "en renta",
          utilityEyebrow: "Util por diseno",
          utilityTitle: "Un marketplace pensado en senales, no en ruido.",
          utilityCards: [
            {
              title: "Busqueda map-first",
              description: "Provincia, canton, distrito, GPS, poligono y filtros vivos.",
              href: "/search"
            },
            {
              title: "Capa de decision",
              description: "Compara favoritas, mira momentum y pregunta con mas contexto.",
              href: "/analysis"
            },
            {
              title: "Publicacion confiable",
              description: "Inventario limpio, boosts, leads y control comercial.",
              href: publishHref
            }
          ],
          featuredEyebrow: "Destacadas",
          featuredTitle: "Propiedades destacadas",
          featuredDescription:
            "Una forma mas limpia de empezar a explorar. Primero aparecen las destacadas y luego sigue el inventario mas reciente.",
          featuredCta: "Ver destacadas",
          featuredSearch: "Abrir busqueda",
          featuredFailed: "No se pudieron cargar las propiedades destacadas en este momento.",
          noProvinceData:
            "Todavia no hay muestra visible para esta provincia. Abre el mapa y explora mas amplio."
        };

  useEffect(() => {
    let cancelled = false;

    const loadFeatured = async () => {
      try {
        const data = await getProperties({ limit: 6, page: 1, sort: "recent" });
        if (cancelled) return;
        setFeatured(data.items || []);
        setFeaturedLoadFailed(false);
      } catch (_error) {
        if (cancelled) return;
        setFeatured([]);
        setFeaturedLoadFailed(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFeatured();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMarketSummary = async () => {
      setMarketSummaryLoading(true);

      try {
        const data = await getZoneSeoData();
        if (cancelled) return;
        setMarketSummary(data.summary || null);
        setMarketSummaryFailed(false);
      } catch (_error) {
        if (cancelled) return;
        setMarketSummary(null);
        setMarketSummaryFailed(true);
      } finally {
        if (!cancelled) {
          setMarketSummaryLoading(false);
        }
      }
    };

    void loadMarketSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!previewProvince || provinceSummaryEntry?.status === "ready" || provinceSummaryEntry?.status === "loading") {
      return;
    }

    let cancelled = false;

    setProvinceSummaryCache((current) => ({
      ...current,
      [provinceSummaryKey]: {
        status: "loading",
        summary: current[provinceSummaryKey]?.summary || null
      }
    }));

    const loadProvinceSummary = async () => {
      try {
        const data = await getZoneSeoData({ province: previewProvince });
        if (cancelled) return;

        setProvinceSummaryCache((current) => ({
          ...current,
          [provinceSummaryKey]: {
            status: "ready",
            summary: data.summary || null
          }
        }));
      } catch (_error) {
        if (cancelled) return;

        setProvinceSummaryCache((current) => ({
          ...current,
          [provinceSummaryKey]: {
            status: "error",
            summary: null
          }
        }));
      }
    };

    void loadProvinceSummary();

    return () => {
      cancelled = true;
    };
  }, [previewProvince, provinceSummaryEntry?.status, provinceSummaryKey]);

  useEffect(() => {
    featured.forEach((property) => {
      if (!property?.featured || !property?._id) {
        return;
      }

      void trackBoostMetricOnce(property._id, boostMetrics.homeImpression, "home");
    });
  }, [featured]);

  useEffect(() => {
    if (
      hasSuggestedProvince ||
      loading ||
      featuredLoadFailed ||
      provinceSummaryLoading ||
      Number(provinceSummary?.totalListings || 0) > 0
    ) {
      return;
    }

    const suggestedProvince = featured
      .map((property) => property?.address?.province)
      .find((value) => Boolean(value));

    if (
      suggestedProvince &&
      normalizeProvinceName(suggestedProvince) !== normalizeProvinceName(province)
    ) {
      setProvince(suggestedProvince);
    }

    setHasSuggestedProvince(true);
  }, [
    featured,
    featuredLoadFailed,
    hasSuggestedProvince,
    loading,
    province,
    provinceSummary,
    provinceSummaryLoading
  ]);

  const featuredForProvince = useMemo(
    () =>
      featured.filter(
        (property) =>
          normalizeProvinceName(property.address?.province) === normalizeProvinceName(previewProvince)
      ),
    [featured, previewProvince]
  );

  const featuredMarketCounts = useMemo(() => {
    const saleCount = featured.filter((item) => item.businessType === "sale").length;
    const rentCount = featured.filter((item) => item.businessType === "rent").length;

    return {
      totalListings: featured.length,
      saleListings: saleCount,
      rentListings: rentCount
    };
  }, [featured]);

  const provinceSignals = useMemo(() => {
    const resolvedCounts =
      marketSummary && !marketSummaryFailed
        ? {
            totalListings: Number(marketSummary.totalListings || 0),
            saleListings: Number(marketSummary.saleListings || 0),
            rentListings: Number(marketSummary.rentListings || 0)
          }
        : featuredMarketCounts;

    const totalValue =
      marketSummaryLoading && !marketSummary ? "..." : resolvedCounts.totalListings;
    const saleValue =
      marketSummaryLoading && !marketSummary ? "..." : resolvedCounts.saleListings;
    const rentValue =
      marketSummaryLoading && !marketSummary ? "..." : resolvedCounts.rentListings;

    return [
      { label: copy.activeNow, value: totalValue },
      { label: copy.forSale, value: saleValue },
      { label: copy.forRent, value: rentValue }
    ];
  }, [
    copy.activeNow,
    copy.forRent,
    copy.forSale,
    featuredMarketCounts,
    marketSummary,
    marketSummaryFailed,
    marketSummaryLoading
  ]);

  const heroSignals = useMemo(
    () => [
      {
        icon: MapPinned,
        label: language === "en" ? "Map-first" : "Map-first"
      },
      {
        icon: Radar,
        label: language === "en" ? "Saved alerts" : "Alertas"
      },
      {
        icon: BrainCircuit,
        label: language === "en" ? "AI compare" : "Comparativa AI"
      },
      {
        icon: ShieldCheck,
        label: language === "en" ? "Clean listings" : "Inventario limpio"
      }
    ],
    [language]
  );

  return (
    <div className="section-pad">
      <section className="app-shell">
        <div className="surface-elevated overflow-hidden bg-hero-grid px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start">
            <div className="space-y-5">
              <span className="eyebrow">{copy.eyebrow}</span>
              <div className="max-w-2xl">
                <h1 className="max-w-2xl font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                  {copy.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink/68 sm:text-[15px]">
                  {copy.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/search?province=${encodeURIComponent(previewProvince)}`}>
                  <Button variant="primary">
                    {copy.explore}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={publishHref}>
                  <Button variant="secondary">{copy.publish}</Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {heroSignals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span key={item.label} className="stat-chip">
                      <Icon className="h-4 w-4 text-pine" />
                      {item.label}
                    </span>
                  );
                })}
              </div>

              <div className="surface-soft grid gap-3 p-4 sm:grid-cols-3">
                {provinceSignals.map((item) => (
                  <div key={item.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                      {item.label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-ink">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <CostaRicaProvinceExplorer
                selectedProvince={province}
                onSelectProvince={setProvince}
                onHoverProvince={setHoveredProvince}
                mapMinHeight={860}
                hero
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="surface-soft p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                {hoveredProvince ? copy.focusProvince : copy.selectedProvince}
              </div>
              <div className="mt-2 text-3xl font-semibold text-ink">{previewProvince}</div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-ink/62">{copy.radarDescription}</p>
              <p className="mt-3 max-w-sm text-xs font-medium uppercase tracking-[0.18em] text-ink/38">
                {copy.hoverHint}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={provincePath}>
                  <Button variant="ghost" className="px-0 py-0 text-sm text-pine hover:bg-transparent">
                    {copy.radarTitle}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {featuredForProvince.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {featuredForProvince.slice(0, 2).map((property) => {
                  const mainPhoto = getMainPhoto(property);

                  return (
                    <Link
                      key={property._id}
                      href={buildBoostPropertyHref(property.slug, "home", Boolean(property.featured))}
                      className="surface-soft grid gap-4 p-4 sm:grid-cols-[180px_1fr]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                        <Image
                          src={mainPhoto?.url || fallbackSrc}
                          alt={mainPhoto?.alt || property.title}
                          fill
                          unoptimized
                          sizes="(max-width: 639px) 100vw, 180px"
                          className="object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackSrc;
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-terracotta">
                            {property.businessType === "rent" ? copy.forRent : copy.forSale}
                          </div>
                          <h2 className="mt-2 text-xl font-semibold text-ink">{property.title}</h2>
                        </div>
                        <div className="text-2xl font-semibold text-ink">
                          {formatCurrency(property.price, property.currency)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="surface-soft p-5 text-sm leading-6 text-ink/62">{copy.noProvinceData}</div>
            )}
          </div>
        </div>
      </section>

      <section className="app-shell mt-10 sm:mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{copy.utilityEyebrow}</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              {copy.utilityTitle}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {copy.utilityCards.map((item, index) => {
            const icons = [MapPinned, BrainCircuit, ShieldCheck];
            const Icon = icons[index] || Radar;

            return (
              <Link key={item.title} href={item.href} className="surface p-5 transition hover:-translate-y-1">
                <div className="inline-flex rounded-2xl bg-pine/10 p-3 text-pine">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/64">{item.description}</p>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-lagoon">
                  {copy.explore}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="app-shell mt-10 space-y-5 sm:mt-14 sm:space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-[#8f540d]">{copy.featuredEyebrow}</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
              {copy.featuredTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/62">
              {copy.featuredDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/destacadas">
              <Button variant="accent">{copy.featuredCta}</Button>
            </Link>
            <Link href="/search?featured=true">
              <Button variant="ghost" className="text-sm text-[#8f540d] hover:bg-white/75">
                {copy.featuredSearch}
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingState
            label={
              language === "en"
                ? "Loading featured properties..."
                : "Cargando propiedades destacadas..."
            }
          />
        ) : featuredLoadFailed ? (
          <div className="surface-soft p-5 text-sm leading-6 text-ink/65">{copy.featuredFailed}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featured.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                boostSurface="home"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
