"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, BriefcaseBusiness, Megaphone, TrendingUp } from "lucide-react";
import { getCommercialOverview, updateMySubscription } from "@/lib/api";
import { MiniLineChart, HorizontalBarList, VerticalBarChart } from "@/components/analysis/VisualCharts";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/utils";

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export default function DashboardBusinessPage() {
  const [overview, setOverview] = useState(null);
  const [flashMessage, setFlashMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingPlanId, setUpdatingPlanId] = useState("");

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    const data = await getCommercialOverview();
    setOverview(data.overview);
  };

  const handlePlanChange = async (planId) => {
    try {
      setUpdatingPlanId(planId);
      setErrorMessage("");
      await updateMySubscription({ plan: planId, billingCycle: "monthly" });
      await loadOverview();
      setFlashMessage("Tu plan comercial se actualizo correctamente.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "No se pudo actualizar el plan en este momento."
      );
    } finally {
      setUpdatingPlanId("");
    }
  };

  if (!overview) {
    return <LoadingState label="Cargando rendimiento comercial..." />;
  }

  const {
    plan,
    summary,
    leadFunnel,
    offerFunnel,
    adPerformance,
    timeline,
    topPerformers,
    provincePerformance,
    trustCoverage,
    optimizationBoard,
    actionableInsights,
    recentLeads,
    recentOffers,
    availablePlans,
    planUsage
  } =
    overview;

  const cards = [
    {
      label: "Propiedades activas",
      value: summary.activeListings,
      helper: `${planUsage.remainingPropertySlots} cupos restantes`
    },
    {
      label: "Visualizaciones",
      value: summary.totalViews.toLocaleString("es-CR"),
      helper: "trafico publico acumulado"
    },
    {
      label: "Leads recibidos",
      value: summary.totalLeads,
      helper: `conversion ${formatPercent(summary.leadConversionRate)}`
    },
    {
      label: "Ofertas recibidas",
      value: summary.totalOffers,
      helper: `conversion ${formatPercent(summary.offerConversionRate)}`
    },
    {
      label: "Destacadas activas",
      value: planUsage.promotedListings,
      helper: `${planUsage.remainingPromotedSlots} espacios premium libres`
    }
  ];

  return (
    <div className="space-y-6">
      <section className="surface bg-hero-grid p-8">
        <span className="eyebrow">Negocio y publicidad</span>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-semibold">Panel comercial para agentes y propietarios</h1>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Aqui ves el valor real del producto: vistas, leads, ofertas, rendimiento de anuncios
              destacados y que propiedades estan convirtiendo mejor.
            </p>
          </div>
          <div className="rounded-[26px] border border-pine/15 bg-white/85 p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-pine/75">Plan activo</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{plan.label}</div>
            <div className="mt-1 text-sm text-ink/60">
              {plan.status === "trial" ? "Prueba activa" : "Activo"} - {formatCurrency(plan.monthlyPrice, "USD")} / mes
            </div>
            <div className="mt-4 grid gap-2 text-sm text-ink/70">
              <div>Limite de propiedades: {plan.propertyLimit}</div>
              <div>Espacios destacados: {plan.promotedSlots}</div>
              <div>Inbox de leads: {plan.leadInbox ? "Incluido" : "No incluido"}</div>
              <div>Ofertas y analitica: {plan.analytics ? "Incluidas" : "No incluidas"}</div>
            </div>
          </div>
        </div>
      </section>

      {flashMessage ? (
        <div className="rounded-2xl border border-pine/20 bg-pine/10 px-4 py-3 text-sm font-medium text-pine">
          {flashMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="surface p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-ink/40">{card.label}</div>
            <div className="mt-4 text-4xl font-semibold">{card.value}</div>
            <div className="mt-3 text-sm text-ink/55">{card.helper}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
            <TrendingUp className="h-4 w-4" />
            Evolucion comercial reciente
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Leads, ofertas y cierres en los ultimos meses</h2>
          <p className="mt-2 text-sm text-ink/60">
            La curva combina interes, negociacion y cierres para mostrar si el pipeline viene creciendo.
          </p>
          <div className="mt-5">
            <MiniLineChart
              series={timeline}
              stroke="#0f4ea9"
              fill="rgba(15, 78, 169, 0.12)"
              emptyLabel="Aun no hay suficientes eventos"
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-mist p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink/45">{item.label}</div>
                <div className="mt-2 text-sm font-semibold text-ink">{item.leads} leads</div>
                <div className="mt-1 text-sm text-ink/60">{item.offers} ofertas - {item.closedDeals} cierres</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-pine">
            <BriefcaseBusiness className="h-4 w-4" />
            Siguientes acciones sugeridas
          </div>
          <div className="mt-4 space-y-3">
            {actionableInsights.map((insight) => (
              <div key={insight} className="rounded-[22px] border border-ink/10 bg-white p-4 text-sm leading-7 text-ink/70">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-pine">
            <BarChart3 className="h-4 w-4" />
            Cobertura de confianza
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Que tan completos y confiables son tus anuncios</h2>
          <p className="mt-2 text-sm text-ink/60">
            Mientras mas alto este este bloque, mas facil sera convertir visitas en leads y ofertas.
          </p>
          <div className="mt-5">
            <VerticalBarChart
              items={trustCoverage || []}
              color="#2c6847"
              valueFormatter={(value) => `${Number(value || 0).toFixed(1)}%`}
            />
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-terracotta">
            <TrendingUp className="h-4 w-4" />
            Prioridades de optimizacion
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Publicaciones que requieren mas atencion</h2>
          <p className="mt-2 text-sm text-ink/60">
            Esto te ayuda a detectar rapido que anuncio pulir primero para acelerar cierres.
          </p>
          <div className="mt-5">
            <HorizontalBarList
              items={(optimizationBoard || []).map((item) => ({
                label: item.label,
                value: item.value,
                subtitle: `${item.attentionLevel.toUpperCase()} - ${item.subtitle}`
              }))}
              color="#e45d35"
              valueFormatter={(value) => `${value}/100`}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-terracotta">
            <BarChart3 className="h-4 w-4" />
            Funnel de leads
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Estado de los contactos</h2>
          <div className="mt-5">
            <VerticalBarChart items={leadFunnel} color="#e45d35" />
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
            <BarChart3 className="h-4 w-4" />
            Funnel de ofertas
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Estado de las propuestas</h2>
          <div className="mt-5">
            <VerticalBarChart items={offerFunnel} color="#0f4ea9" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Propiedades con mejor rendimiento</h2>
          <p className="mt-2 text-sm text-ink/60">
            Estas son las publicaciones que mejor convierten visitas en conversaciones comerciales.
          </p>
          <div className="mt-5">
            <HorizontalBarList items={topPerformers} color="#2c6847" />
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Zonas con mayor respuesta</h2>
          <p className="mt-2 text-sm text-ink/60">
            Combina leads y ofertas para ver en que provincias tu inventario se mueve mejor.
          </p>
          <div className="mt-5">
            <HorizontalBarList items={provincePerformance} color="#0f4ea9" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-pine">
            <Megaphone className="h-4 w-4" />
            Rendimiento de publicidad interna
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Impacto de tus publicaciones destacadas</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Destacadas activas</div>
              <div className="mt-2 text-2xl font-semibold">{adPerformance.promotedListings}</div>
              <div className="mt-1 text-sm text-ink/60">
                de {adPerformance.promotedSlots} espacios disponibles
              </div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Alcance estimado</div>
              <div className="mt-2 text-2xl font-semibold">
                {adPerformance.estimatedReach.toLocaleString("es-CR")}
              </div>
              <div className="mt-1 text-sm text-ink/60">visibilidad interna acumulada</div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">CTR interno</div>
              <div className="mt-2 text-2xl font-semibold">{formatPercent(adPerformance.ctr)}</div>
              <div className="mt-1 text-sm text-ink/60">clics al anuncio / alcance</div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Leads impulsados</div>
              <div className="mt-2 text-2xl font-semibold">{adPerformance.leads}</div>
              <div className="mt-1 text-sm text-ink/60">tasa {formatPercent(adPerformance.leadRate)}</div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Ofertas impulsadas</div>
              <div className="mt-2 text-2xl font-semibold">{adPerformance.offers}</div>
              <div className="mt-1 text-sm text-ink/60">tasa {formatPercent(adPerformance.offerRate)}</div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Favoritos impulsados</div>
              <div className="mt-2 text-2xl font-semibold">{adPerformance.favorites}</div>
              <div className="mt-1 text-sm text-ink/60">{adPerformance.views} vistas desde destacados</div>
            </div>
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Planes recomendados</h2>
          <p className="mt-2 text-sm text-ink/60">
            Modelo pensado para que veas valor primero y luego escales por visibilidad y resultados.
          </p>
          <div className="mt-5 space-y-3">
            {availablePlans.map((item) => {
              const active = item.id === plan.plan;

              return (
                <div
                  key={item.id}
                  className={`rounded-[24px] border p-4 ${
                    active ? "border-pine/25 bg-pine/8" : "border-ink/10 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-ink">{item.name}</div>
                      <div className="mt-1 text-sm text-ink/60">
                        {formatCurrency(item.monthlyPrice, "USD")} / mes - {item.propertyLimit} propiedades -{" "}
                        {item.promotedSlots} destacados
                      </div>
                    </div>
                    {active ? (
                      <span className="rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                        Activo
                      </span>
                    ) : (
                      <Button
                        variant={item.promotedSlots > plan.promotedSlots ? "success" : "secondary"}
                        onClick={() => handlePlanChange(item.id)}
                        disabled={Boolean(updatingPlanId)}
                        className="px-3 py-2 text-xs"
                      >
                        {updatingPlanId === item.id ? "Actualizando..." : "Activar plan"}
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
                    {item.features.map((feature) => (
                      <span key={feature} className="rounded-full bg-mist px-3 py-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Leads recientes</h2>
            <Link href="/dashboard/leads">
              <Button variant="secondary">Abrir bandeja</Button>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentLeads.length ? (
              recentLeads.map((lead) => (
                <div key={lead._id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="font-semibold text-ink">{lead.name}</div>
                  <div className="mt-1 text-sm text-ink/55">
                    {lead.property?.title} - {lead.email}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/55">Todavia no has recibido leads.</p>
            )}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Ofertas recientes</h2>
            <Link href="/dashboard/offers">
              <Button variant="secondary">Abrir ofertas</Button>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentOffers.length ? (
              recentOffers.map((offer) => (
                <div key={offer._id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="font-semibold text-ink">
                    {formatCurrency(offer.amount, offer.currency)} - {offer.name}
                  </div>
                  <div className="mt-1 text-sm text-ink/55">
                    {offer.property?.title} - {offer.email}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/55">Todavia no has recibido ofertas.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
