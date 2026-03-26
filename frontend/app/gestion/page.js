"use client";

import Link from "next/link";
import { Building2, Eye, Globe2, LayoutDashboard, LineChart, Radar, Settings2, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getManagementOverview } from "@/lib/api";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

const numberFormatter = new Intl.NumberFormat("es-CR");

const formatValue = (value) => numberFormatter.format(Number(value || 0));

export default function ManagementPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getManagementOverview();

        if (!cancelled) {
          setOverview(data.overview || null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setOverview(null);
          setError(nextError?.response?.data?.message || "No se pudo cargar Gestion.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  const platform = useMemo(() => overview?.platform || {}, [overview]);
  const commercialOverview = useMemo(() => overview?.commercialOverview || {}, [overview]);
  const businessSummary = useMemo(() => commercialOverview?.summary || {}, [commercialOverview]);
  const adPerformance = useMemo(() => commercialOverview?.adPerformance || {}, [commercialOverview]);
  const topPerformers = useMemo(() => commercialOverview?.topPerformers || [], [commercialOverview]);
  const optimizationBoard = useMemo(
    () => commercialOverview?.optimizationBoard || [],
    [commercialOverview]
  );
  const actionableInsights = useMemo(
    () => commercialOverview?.actionableInsights || [],
    [commercialOverview]
  );

  const publicPulseCards = useMemo(
    () => [
      {
        label: "Publicaciones activas",
        value: platform.published,
        helper: `${formatValue(platform.saleListings)} venta - ${formatValue(platform.rentListings)} renta`,
        icon: Building2
      },
      {
        label: "Usuarios registrados",
        value: platform.users,
        helper: `${formatValue(platform.newUsersLast30Days)} nuevos en 30 dias`,
        icon: Users
      },
      {
        label: "Vistas a fichas",
        value: platform.totalViews,
        helper: "trafico medido sobre propiedades",
        icon: Eye
      },
      {
        label: "Leads globales",
        value: platform.leads,
        helper: `${formatValue(platform.totalListingLeads)} atribuidos a publicaciones`,
        icon: Radar
      }
    ],
    [platform]
  );

  const platformMetrics = useMemo(
    () => [
      { label: "Favoritos", value: platform.favorites },
      { label: "Busquedas guardadas", value: platform.savedSearches },
      { label: "Destacadas", value: platform.featured },
      { label: "Ofertas", value: platform.offers },
      { label: "Impresiones home", value: platform.homeImpressions },
      { label: "Impresiones rail", value: platform.searchRailImpressions },
      { label: "Impresiones mapa", value: platform.mapImpressions },
      { label: "Aperturas de ficha", value: platform.cardOpens }
    ],
    [platform]
  );

  const myOperationCards = useMemo(
    () => [
      {
        label: "Mis activas",
        value: businessSummary.activeListings,
        helper: `${formatValue(businessSummary.totalListings)} publicaciones totales`
      },
      {
        label: "Mis vistas",
        value: businessSummary.totalViews,
        helper: "rendimiento de mi inventario"
      },
      {
        label: "Mis leads",
        value: businessSummary.totalLeads,
        helper: `conversion ${businessSummary.leadConversionRate || 0}%`
      },
      {
        label: "Mis ofertas",
        value: businessSummary.totalOffers,
        helper: `conversion ${businessSummary.offerConversionRate || 0}%`
      }
    ],
    [businessSummary]
  );

  const quickActions = [
    { href: "/dashboard", label: "Dashboard general", description: "Resumen operativo y alertas." },
    { href: "/dashboard/business", label: "Panel de negocio", description: "Leads, boost y rendimiento." },
    { href: "/dashboard/properties/new", label: "Nueva propiedad", description: "Publicar inventario real." },
    { href: "/dashboard/saved-searches", label: "Alertas", description: "Gestionar busquedas y correo." },
    { href: "/search", label: "Explorar", description: "Validar mapa y lectura de mercado." },
    { href: "/analysis", label: "Analisis", description: "Revisar inteligencia del mercado." }
  ];

  if (loading) {
    return (
      <ProtectedRoute requireManagementAccess>
        <div className="app-shell section-pad">
          <LoadingState label="Cargando Gestion..." />
        </div>
      </ProtectedRoute>
    );
  }

  if (!overview) {
    return (
      <ProtectedRoute requireManagementAccess>
        <div className="app-shell section-pad">
          <EmptyState
            title="Gestion no disponible"
            description={error || "No se pudieron cargar las metricas privadas."}
            actionLabel="Reintentar"
            onAction={() => window.location.reload()}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireManagementAccess>
      <div className="app-shell section-pad space-y-6">
        <section className="surface-elevated overflow-hidden bg-hero-grid px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Gestion privada</span>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">
                Centro de control de BienesRaicesCR
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/64">
                Aqui concentramos el contador que antes estaba en inicio, el pulso del inventario,
                la actividad de publicaciones y las herramientas rapidas para operar la plataforma.
              </p>
            </div>

            <div className="surface-soft flex min-w-[240px] flex-col gap-2 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                Trafico medido
              </div>
              <div className="text-3xl font-semibold text-ink">{formatValue(platform.totalViews)}</div>
              <div className="text-sm text-ink/58">
                vistas a fichas y {formatValue(platform.boostSurfaceExposure)} impresiones boost acumuladas
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {publicPulseCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="surface-soft p-4">
                <div className="inline-flex rounded-2xl bg-pine/10 p-3 text-pine">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                  {card.label}
                </div>
                <div className="mt-2 text-3xl font-semibold text-ink">{formatValue(card.value)}</div>
                <div className="mt-2 text-sm text-ink/58">{card.helper}</div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-soft p-5">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-lagoon" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                  Plataforma
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-ink">Metricas globales</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {platformMetrics.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/70 bg-white/84 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-ink">{formatValue(item.value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-soft p-5">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-pine" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                  Mi operacion
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-ink">Rendimiento propio</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {myOperationCards.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/70 bg-white/84 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-ink">{formatValue(item.value)}</div>
                  <div className="mt-2 text-sm text-ink/58">{item.helper}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[22px] border border-white/70 bg-white/84 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                Boost actual
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-2xl font-semibold text-ink">
                    {formatValue(adPerformance.boostSurfaceExposure)}
                  </div>
                  <div className="text-sm text-ink/58">impresiones impulsadas</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-ink">{formatValue(adPerformance.leads)}</div>
                  <div className="text-sm text-ink/58">leads atribuidos a destacados</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-soft p-5">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-terracotta" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                  Herramientas
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-ink">Accesos rapidos</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickActions.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-[22px] border border-white/70 bg-white/84 px-4 py-4 transition hover:-translate-y-0.5">
                  <div className="text-base font-semibold text-ink">{item.label}</div>
                  <div className="mt-2 text-sm leading-6 text-ink/60">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-soft p-5">
              <div className="flex items-center gap-3">
                <LineChart className="h-5 w-5 text-pine" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                    Top publicaciones
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold text-ink">Mejor traccion</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {topPerformers.length ? (
                  topPerformers.map((item, index) => (
                    <div
                      key={item.slug || item.label}
                      className="flex items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/84 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4dc] text-xs font-semibold text-[#8f540d]">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-ink">{item.label}</div>
                            <div className="text-xs text-ink/52">{item.subtitle}</div>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-sm font-semibold text-ink">
                        {formatValue(item.value)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-ink/58">Aun no hay suficiente traccion para destacar publicaciones.</div>
                )}
              </div>
            </div>

            <div className="surface-soft p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/42">
                    Prioridades
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold text-ink">Siguiente foco</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[...optimizationBoard, ...actionableInsights].slice(0, 4).map((item, index) => (
                  <div key={`${item.label || item}-${index}`} className="rounded-[22px] border border-white/70 bg-white/84 px-4 py-3">
                    <div className="text-sm font-semibold text-ink">
                      {item.label || `Insight ${index + 1}`}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-ink/60">
                      {item.subtitle || item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
