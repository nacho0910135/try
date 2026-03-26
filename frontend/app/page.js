"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, BrainCircuit, MapPinned, Radar, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProperties, getZoneSeoData } from "@/lib/api";
import { boostMetrics, trackBoostMetricOnce } from "@/lib/boost-metrics";
import { slugifyLocation } from "@/lib/zone-seo";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { MapLoadingShell } from "@/components/map/MapLoadingShell";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/utils";
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

const EMPTY_ITEMS = [];

export default function HomePage() {
  const { language } = useLanguage();
  const { token } = useAuthStore();
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
  const previewProvince = hoveredProvince || province;
  const publishHref = token ? "/dashboard/properties/new" : "/login";
  const provincePath = `/zona/${slugifyLocation(previewProvince)}`;
  const provinceSummaryKey = normalizeProvinceName(previewProvince);
  const provinceSummaryEntry = provinceSummaryCache[provinceSummaryKey];
  const provinceSummary = provinceSummaryEntry?.summary || null;
  const provinceSummaryLoading = provinceSummaryEntry?.status === "loading";
  const provinceSummaryFailed = provinceSummaryEntry?.status === "error";

  const copy =
    language === "en"
      ? {
          eyebrow: "Market intelligence",
          title: "Understand Costa Rica real estate before chasing listings.",
          description:
            "Read prices by zone, follow rent signals, compare areas, and spot where buying or investing makes more sense.",
          explore: "Analyze the map",
          publish: "Publish property",
          selectedProvince: "Active province",
          focusProvince: "Province in focus",
          radarTitle: "Rent radar",
          radarDescription:
            "Average rent by canton and district inside this province, sorted from highest to lowest.",
          radarCta: "Open province",
          hoverHint: "Move across the map to preview another province instantly.",
          activeNow: "active now",
          forSale: "for sale",
          forRent: "for rent",
          rentByCanton: "Cantons",
          rentByDistrict: "Districts",
          pricePerSquareMeterByDistrict: "Land / m2 by district",
          dominantCurrency: "Main currency",
          avgRent: "avg rent",
          avgPricePerSquareMeter: "avg / m2",
          rentalListings: "rentals",
          landListings: "land comps",
          rentalLoading: "Calculating rent averages...",
          utilityEyebrow: "Useful intelligence",
          utilityTitle: "Start by reading the market, then move into listings with more context.",
          utilityCards: [
            {
              title: "Price map",
              description: "Read sale, rent, and price-per-square-meter signals from one map.",
              href: "/search"
            },
            {
              title: "Rent radar",
              description: "See where average rents are pushing higher before you commit to a zone.",
              href: provincePath
            },
            {
              title: "Decision layer",
              description: "Compare signals, inspect momentum, and size up an area faster.",
              href: "/analysis"
            }
          ],
          featuredEyebrow: "Featured",
          featuredTitle: "Featured listings",
          featuredDescription:
            "A cleaner way to start exploring. Featured listings appear first and then the freshest inventory continues right behind them.",
          featuredCta: "Open featured",
          featuredSearch: "Open search",
          featuredFailed: "Featured listings could not be loaded right now.",
          noProvinceData:
            "There is not enough rental or land-sale inventory in this province yet to calculate useful signals."
        }
      : {
          eyebrow: "Inteligencia inmobiliaria",
          title: "Entiende el mercado inmobiliario de Costa Rica antes de perseguir listings.",
          description:
            "Lee precios por zona, sigue señales de renta, compara provincias y detecta donde comprar o invertir tiene mas sentido.",
          explore: "Analizar el mapa",
          publish: "Publicar propiedad",
          selectedProvince: "Provincia activa",
          focusProvince: "Provincia en foco",
          radarTitle: "Radar de renta",
          radarDescription:
            "Promedio de alquiler por canton y distrito dentro de esta provincia, ordenado del mas alto al mas bajo.",
          radarCta: "Abrir provincia",
          hoverHint: "Pasa el cursor por el mapa para cambiar esta lectura al instante.",
          activeNow: "activas ahora",
          forSale: "en venta",
          forRent: "en renta",
          rentByCanton: "Cantones",
          rentByDistrict: "Distritos",
          pricePerSquareMeterByDistrict: "Precio / m2 por distrito",
          dominantCurrency: "Moneda dominante",
          avgRent: "renta promedio",
          avgPricePerSquareMeter: "promedio / m2",
          rentalListings: "alquileres",
          landListings: "comparables",
          rentalLoading: "Calculando promedios de renta...",
          utilityEyebrow: "Inteligencia util",
          utilityTitle: "Empieza leyendo el mercado y luego entra a los listings con mas contexto.",
          utilityCards: [
            {
              title: "Mapa de precios",
              description: "Lee venta, alquiler y precio por m2 desde una sola vista.",
              href: "/search"
            },
            {
              title: "Radar de renta",
              description: "Detecta donde la renta promedio se esta moviendo antes de decidir.",
              href: provincePath
            },
            {
              title: "Capa de decision",
              description: "Compara senales, mira momentum y entiende mejor cada zona.",
              href: "/analysis"
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
            "Todavia no hay suficiente inventario de alquiler o de terrenos en venta para calcular senales utiles."
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

        setProvinceSummaryCache((current) => ({
          ...current,
          [provinceSummaryKey]: {
            status: "ready",
            summary: data.summary || null
          }
        }));
      } catch (_error) {
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
        label: language === "en" ? "Price map" : "Mapa de precios"
      },
      {
        icon: Radar,
        label: language === "en" ? "Rent radar" : "Radar de renta"
      },
      {
        icon: BrainCircuit,
        label: language === "en" ? "Compare zones" : "Comparar zonas"
      },
      {
        icon: ShieldCheck,
        label: language === "en" ? "Cleaner reads" : "Lectura mas clara"
      }
    ],
    [language]
  );

  const rentalMarket = provinceSummary?.rentalMarket || null;
  const pricePerSquareMeterMarket = provinceSummary?.pricePerSquareMeterMarket || null;
  const cantonRentRows = rentalMarket?.byCanton || EMPTY_ITEMS;
  const districtRentRows = rentalMarket?.byDistrict || EMPTY_ITEMS;
  const districtPricePerSquareMeterRows = pricePerSquareMeterMarket?.byDistrict || EMPTY_ITEMS;
  const marketColumns = [
    {
      title: copy.rentByCanton,
      items: cantonRentRows,
      metricLabel: copy.avgRent,
      listingLabel: copy.rentalListings,
      renderValue: (item) => formatCurrency(item.averagePrice, rentalMarket?.currency || "USD")
    },
    {
      title: copy.rentByDistrict,
      items: districtRentRows,
      metricLabel: copy.avgRent,
      listingLabel: copy.rentalListings,
      renderValue: (item) => formatCurrency(item.averagePrice, rentalMarket?.currency || "USD")
    },
    {
      title: copy.pricePerSquareMeterByDistrict,
      items: districtPricePerSquareMeterRows,
      metricLabel: copy.avgPricePerSquareMeter,
      listingLabel: copy.landListings,
      renderValue: (item) =>
        `${formatCurrency(
          item.averagePricePerSquareMeter,
          pricePerSquareMeterMarket?.currency || "USD"
        )}/m2`
    }
  ].filter((column) => column.items.length > 0);
  const hasMarketColumns = marketColumns.length > 0;
  const primaryMarketCurrency = rentalMarket?.currency || pricePerSquareMeterMarket?.currency || null;

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

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,1.44fr)]">
            <div className="surface-soft h-fit p-3.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                {hoveredProvince ? copy.focusProvince : copy.selectedProvince}
              </div>
              <div className="mt-1.5 text-[26px] font-semibold leading-none text-ink">
                {previewProvince}
              </div>
              <p className="mt-2 max-w-[20rem] text-[12px] leading-5 text-ink/62">
                {copy.radarDescription}
              </p>
              <p className="mt-2 max-w-[20rem] text-[10px] font-medium uppercase tracking-[0.16em] text-ink/38">
                {copy.hoverHint}
              </p>
              {primaryMarketCurrency ? (
                <div className="mt-2.5 inline-flex rounded-full border border-[#eccb8e] bg-[#fff4dc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f540d]">
                  {copy.dominantCurrency}: {primaryMarketCurrency}
                </div>
              ) : null}
              <div className="mt-2.5 flex flex-wrap gap-3">
                <Link href={provincePath}>
                  <Button variant="ghost" className="px-0 py-0 text-[13px] text-pine hover:bg-transparent">
                    {copy.radarCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {provinceSummaryLoading && !hasMarketColumns && !provinceSummaryFailed ? (
              <div className="surface-soft flex items-center justify-center p-5 text-sm leading-6 text-ink/62">
                {copy.rentalLoading}
              </div>
            ) : hasMarketColumns ? (
              <div
                className={`grid gap-4 ${
                  marketColumns.length === 1
                    ? ""
                    : marketColumns.length === 2
                      ? "xl:grid-cols-2"
                      : "xl:grid-cols-3"
                }`}
              >
                {marketColumns.map((column) => (
                  <div key={column.title} className="surface-soft p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                        {column.title}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/34">
                        {column.metricLabel}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {column.items.map((item, index) => (
                        <div
                          key={`${column.title}-${item.label}`}
                          className="flex items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/84 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4dc] text-xs font-semibold text-[#8f540d]">
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-ink">{item.label}</div>
                                <div className="text-xs text-ink/52">
                                  {item.listings} {column.listingLabel}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right text-sm font-semibold text-ink">
                            {column.renderValue(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
            const icons = [MapPinned, Radar, BrainCircuit];
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
