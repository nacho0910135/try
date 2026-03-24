"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight, BrainCircuit, MapPinned, Radar, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getFeaturedProperties } from "@/lib/api";
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

export default function HomePage() {
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoadFailed, setFeaturedLoadFailed] = useState(false);
  const [province, setProvince] = useState("San Jose");
  const fallbackSrc = "/property-placeholder.svg";
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : "/login";
  const provincePath = `/zona/${slugifyLocation(province)}`;

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
          radarTitle: "Live read",
          radarDescription: "A sharp sample of what is already moving in this province.",
          featuredNow: "featured now",
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
          inventoryEyebrow: "Open inventory",
          inventoryTitle: "Listings worth opening",
          seeAll: "See everything",
          featuredFailed: "Featured inventory could not be loaded right now.",
          noProvinceData: "No featured sample for this province yet. Open the map and explore wider."
        }
      : {
          eyebrow: "Costa Rica, sin ruido",
          title: "Mapa, radar y listings que si ayudan a decidir.",
          description:
            "Explora por provincia, compara mas rapido y publica con datos mas limpios desde el primer minuto.",
          explore: "Abrir mapa",
          publish: "Publicar propiedad",
          selectedProvince: "Provincia activa",
          radarTitle: "Lectura en vivo",
          radarDescription: "Una muestra corta y util de lo que ya se mueve en esta provincia.",
          featuredNow: "destacadas ahora",
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
          inventoryEyebrow: "Inventario abierto",
          inventoryTitle: "Propiedades que vale la pena abrir",
          seeAll: "Ver todo",
          featuredFailed: "No se pudo cargar el inventario destacado en este momento.",
          noProvinceData:
            "Todavia no hay muestra destacada para esta provincia. Abre el mapa y explora mas amplio."
        };

  useEffect(() => {
    let cancelled = false;

    const loadFeatured = async () => {
      try {
        const data = await getFeaturedProperties();
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

  const featuredForProvince = useMemo(
    () => featured.filter((property) => property.address?.province === province),
    [featured, province]
  );

  const provinceSignals = useMemo(() => {
    const saleCount = featuredForProvince.filter((item) => item.businessType === "sale").length;
    const rentCount = featuredForProvince.filter((item) => item.businessType === "rent").length;

    return [
      { label: copy.featuredNow, value: featuredForProvince.length },
      { label: copy.forSale, value: saleCount },
      { label: copy.forRent, value: rentCount }
    ];
  }, [copy.featuredNow, copy.forRent, copy.forSale, featuredForProvince]);

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
                <Link href={`/search?province=${encodeURIComponent(province)}`}>
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
                mapMinHeight={860}
                hero
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="surface-soft p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                {copy.selectedProvince}
              </div>
              <div className="mt-2 text-3xl font-semibold text-ink">{province}</div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-ink/62">{copy.radarDescription}</p>
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
                      href={`/properties/${property.slug}`}
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
            <span className="eyebrow">{copy.inventoryEyebrow}</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
              {copy.inventoryTitle}
            </h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-lagoon">
            {copy.seeAll}
          </Link>
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
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
