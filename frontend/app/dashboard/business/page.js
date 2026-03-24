"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Megaphone,
  TrendingUp
} from "lucide-react";
import { createPayPalDonationOrder, getCommercialOverview } from "@/lib/api";
import {
  MiniLineChart,
  HorizontalBarList,
  VerticalBarChart
} from "@/components/analysis/VisualCharts";
import { LoadingState } from "@/components/ui/LoadingState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { formatCurrency } from "@/lib/utils";

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export default function DashboardBusinessPage() {
  const { language } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [flashMessage, setFlashMessage] = useState("");
  const [donationAmount, setDonationAmount] = useState(10);
  const [donorName, setDonorName] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      setOverviewError("");
      const data = await getCommercialOverview();
      setOverview(data.overview);
    } catch (error) {
      setOverview(null);
      setOverviewError(
        error.response?.data?.message || "No pudimos cargar la visibilidad comercial."
      );
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const paypalStatus = params.get("paypal");

    if (paypalStatus === "donation-success") {
      setFlashMessage("Gracias por apoyar BienesRaicesCR. Tu donacion ya fue confirmada.");
    } else if (paypalStatus === "donation-cancelled") {
      setFlashMessage("La donacion con PayPal fue cancelada.");
    } else if (paypalStatus === "donation-error") {
      setFlashMessage("No pudimos confirmar la donacion en PayPal. Intenta de nuevo.");
    }

    if (paypalStatus) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("paypal");
      window.history.replaceState({}, "", nextUrl.toString());
    }
  }, []);

  if (loadingOverview) {
    return <LoadingState label="Cargando visibilidad y metricas..." />;
  }

  if (!overview) {
    return (
      <EmptyState
        title="No pudimos cargar este panel"
        description={overviewError || "Intenta de nuevo en unos segundos."}
        actionLabel="Reintentar"
        onAction={loadOverview}
      />
    );
  }

  const summary = {
    activeListings: Number(overview.summary?.activeListings || 0),
    totalListings: Number(overview.summary?.totalListings || 0),
    totalViews: Number(overview.summary?.totalViews || 0),
    totalLeads: Number(overview.summary?.totalLeads || 0),
    totalOffers: Number(overview.summary?.totalOffers || 0),
    leadConversionRate: Number(overview.summary?.leadConversionRate || 0),
    offerConversionRate: Number(overview.summary?.offerConversionRate || 0)
  };
  const leadFunnel = Array.isArray(overview.leadFunnel) ? overview.leadFunnel : [];
  const offerFunnel = Array.isArray(overview.offerFunnel) ? overview.offerFunnel : [];
  const adPerformance = {
    promotedListings: Number(overview.adPerformance?.promotedListings || 0),
    promotedSlots: Number(overview.adPerformance?.promotedSlots || 0),
    estimatedReach: Number(overview.adPerformance?.estimatedReach || 0),
    views: Number(overview.adPerformance?.views || 0),
    favorites: Number(overview.adPerformance?.favorites || 0),
    leads: Number(overview.adPerformance?.leads || 0),
    offers: Number(overview.adPerformance?.offers || 0),
    ctr: Number(overview.adPerformance?.ctr || 0),
    leadRate: Number(overview.adPerformance?.leadRate || 0),
    offerRate: Number(overview.adPerformance?.offerRate || 0),
    boostOpenRate: Number(overview.adPerformance?.boostOpenRate || 0),
    attributedLeadRate: Number(overview.adPerformance?.attributedLeadRate || 0),
    boostSurfaceMetrics: {
      homeImpressions: Number(overview.adPerformance?.boostSurfaceMetrics?.homeImpressions || 0),
      searchRailImpressions: Number(
        overview.adPerformance?.boostSurfaceMetrics?.searchRailImpressions || 0
      ),
      mapImpressions: Number(overview.adPerformance?.boostSurfaceMetrics?.mapImpressions || 0),
      cardOpens: Number(overview.adPerformance?.boostSurfaceMetrics?.cardOpens || 0),
      leads: Number(overview.adPerformance?.boostSurfaceMetrics?.leads || 0)
    }
  };
  const timeline = Array.isArray(overview.timeline) ? overview.timeline : [];
  const topPerformers = Array.isArray(overview.topPerformers) ? overview.topPerformers : [];
  const provincePerformance = Array.isArray(overview.provincePerformance)
    ? overview.provincePerformance
    : [];
  const trustCoverage = Array.isArray(overview.trustCoverage) ? overview.trustCoverage : [];
  const optimizationBoard = Array.isArray(overview.optimizationBoard)
    ? overview.optimizationBoard
    : [];
  const actionableInsights = Array.isArray(overview.actionableInsights)
    ? overview.actionableInsights
    : [];
  const recentLeads = Array.isArray(overview.recentLeads) ? overview.recentLeads : [];
  const recentOffers = Array.isArray(overview.recentOffers) ? overview.recentOffers : [];
  const boostedListingPerformance = Array.isArray(overview.boostedListingPerformance)
    ? overview.boostedListingPerformance
    : [];
  const donationConfig = overview.billing?.donations || null;
  const donationSuggestions = Array.isArray(donationConfig?.suggestedAmounts)
    ? donationConfig.suggestedAmounts
    : [];
  const numberLocale = language === "en" ? "en-US" : "es-CR";
  const boostCopy =
    language === "en"
      ? {
          surfaceEyebrow: "Boost surfaces",
          surfaceTitle: "Where the boost is getting seen",
          surfaceDescription:
            "Internal counts for the premium placements that boosted listings receive inside the marketplace.",
          home: "Home",
          searchRail: "Search rail",
          map: "Map",
          cardOpens: "Detail opens",
          leads: "Attributed leads",
          homeHint: "homepage featured visibility",
          searchRailHint: "premium search module",
          mapHint: "premium map bubble",
          cardOpensHint: "opens after a boosted click",
          leadsHint: "leads attributed to boosted journeys",
          openRate: "Open rate from surfaces",
          attributedLeadRate: "Lead rate from boosted opens",
          byListingTitle: "Boost breakdown by listing",
          byListingDescription:
            "Useful to see which boosted property converts better by placement.",
          emptyByListing: "No active boosted listings yet."
        }
      : {
          surfaceEyebrow: "Superficies del boost",
          surfaceTitle: "Donde se esta viendo el boost",
          surfaceDescription:
            "Conteos internos de las ubicaciones premium que reciben tus anuncios con boost dentro del marketplace.",
          home: "Portada",
          searchRail: "Rail de busqueda",
          map: "Mapa",
          cardOpens: "Aperturas de ficha",
          leads: "Leads atribuidos",
          homeHint: "visibilidad destacada en portada",
          searchRailHint: "modulo premium del buscador",
          mapHint: "burbuja premium en el mapa",
          cardOpensHint: "aperturas despues de un click impulsado",
          leadsHint: "leads nacidos desde recorridos con boost",
          openRate: "Tasa de apertura desde superficies",
          attributedLeadRate: "Tasa de lead desde aperturas impulsadas",
          byListingTitle: "Desglose del boost por anuncio",
          byListingDescription:
            "Sirve para ver que propiedad con boost convierte mejor segun la ubicacion premium.",
          emptyByListing: "Todavia no hay publicaciones con boost activas."
        };

  const handleDonation = async (amountOverride) => {
    try {
      setDonationLoading(true);
      const data = await createPayPalDonationOrder({
        amount: amountOverride ?? donationAmount,
        donorName
      });
      const approvalUrl = data?.order?.approvalUrl;

      if (!approvalUrl) {
        throw new Error("PayPal no devolvio una URL de aprobacion valida.");
      }

      window.location.href = approvalUrl;
    } catch (error) {
      setFlashMessage(error.response?.data?.message || "No se pudo iniciar la donacion con PayPal.");
    } finally {
      setDonationLoading(false);
    }
  };

  const cards = [
    {
      label: "Propiedades activas",
      value: summary.activeListings,
      helper: `${summary.totalListings} publicaciones totales`
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
      label: "Boost activos",
      value: adPerformance.promotedListings,
      helper: "publicaciones destacadas ahora mismo"
    }
  ];
  const boostSurfaceCards = [
    {
      label: boostCopy.home,
      value: adPerformance.boostSurfaceMetrics.homeImpressions,
      helper: boostCopy.homeHint
    },
    {
      label: boostCopy.searchRail,
      value: adPerformance.boostSurfaceMetrics.searchRailImpressions,
      helper: boostCopy.searchRailHint
    },
    {
      label: boostCopy.map,
      value: adPerformance.boostSurfaceMetrics.mapImpressions,
      helper: boostCopy.mapHint
    },
    {
      label: boostCopy.cardOpens,
      value: adPerformance.boostSurfaceMetrics.cardOpens,
      helper: boostCopy.cardOpensHint
    },
    {
      label: boostCopy.leads,
      value: adPerformance.boostSurfaceMetrics.leads,
      helper: boostCopy.leadsHint
    }
  ];

  return (
    <div className="space-y-6">
      <section className="surface bg-hero-grid p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <span className="eyebrow">Visibilidad y resultados</span>
            <h1 className="mt-4 font-serif text-4xl font-semibold">
              Panel comercial para agentes y propietarios
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Publicar y explorar es gratis. El foco comercial actual es medir que publicaciones
              generan mas interes y usar destacados como boost de visibilidad cuando quieras
              empujar un anuncio por encima del resto.
            </p>
          </div>
          <div className="rounded-[26px] border border-pine/15 bg-white/85 p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-pine/75">
              Modelo vigente
            </div>
            <div className="mt-2 text-2xl font-semibold text-ink">Gratis para publicar y explorar</div>
            <div className="mt-1 text-sm text-ink/60">
              El unico upgrade comercial activo es el boost de visibilidad en destacados.
            </div>
            <div className="mt-4 grid gap-2 text-sm text-ink/70">
              <div>{summary.activeListings} propiedades activas</div>
              <div>{adPerformance.promotedListings} boosts activos</div>
              <div>{summary.totalLeads} leads y {summary.totalOffers} ofertas acumuladas</div>
            </div>
          </div>
        </div>
      </section>

      {flashMessage ? (
        <div className="rounded-2xl border border-pine/20 bg-pine/10 px-4 py-3 text-sm font-medium text-pine">
          {flashMessage}
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
            <Megaphone className="h-4 w-4" />
            Checkout PayPal
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Boost de visibilidad para tus publicaciones</h2>
          <p className="mt-2 text-sm text-ink/60">
            Cada boost se paga una sola vez y activa la propiedad destacada dentro del marketplace.
          </p>
          <div className="mt-5 rounded-[24px] border border-ink/10 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Precio actual</div>
            <div className="mt-2 text-4xl font-semibold text-ink">
              {overview.billing?.boost
                ? formatCurrency(overview.billing.boost.price, overview.billing.boost.currency)
                : "Configura PayPal"}
            </div>
            <p className="mt-3 text-sm text-ink/60">
              La compra del boost se inicia desde <strong>Mis propiedades</strong>, justo en la fila del anuncio
              que quieres impulsar.
            </p>
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-pine">
            <BriefcaseBusiness className="h-4 w-4" />
            Donaciones
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Apoya el crecimiento de la plataforma</h2>
          <p className="mt-2 text-sm text-ink/60">
            Si quieres apoyar BienesRaicesCR, puedes enviar una donacion por PayPal y nos ayudas a seguir
            mejorando la experiencia.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {donationSuggestions.map((amount) => (
              <Button
                key={amount}
                variant="secondary"
                className="w-full"
                onClick={() => handleDonation(amount)}
                disabled={donationLoading || !donationConfig?.enabled}
              >
                Donar {formatCurrency(amount, donationConfig?.currency || "USD")}
              </Button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="field-label">Nombre para la donacion</label>
              <Input
                value={donorName}
                onChange={(event) => setDonorName(event.target.value)}
                placeholder="Tu nombre o alias"
              />
            </div>
            <div>
              <label className="field-label">Monto personalizado</label>
              <Input
                type="number"
                min={donationConfig?.minAmount || 1}
                step="0.01"
                value={donationAmount}
                onChange={(event) => setDonationAmount(event.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleDonation()}
              disabled={donationLoading || !donationConfig?.enabled}
            >
              {donationLoading ? "Abriendo PayPal..." : "Donar con PayPal"}
            </Button>
            <span className="text-sm text-ink/55">
              Donacion minima:{" "}
              {formatCurrency(donationConfig?.minAmount || 0, donationConfig?.currency || "USD")}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
            <TrendingUp className="h-4 w-4" />
            Evolucion comercial reciente
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Leads, ofertas y cierres en los ultimos meses</h2>
          <p className="mt-2 text-sm text-ink/60">
            La curva combina interes, negociacion y cierres para mostrar si tu pipeline viene creciendo.
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
                <div className="mt-1 text-sm text-ink/60">
                  {item.offers} ofertas - {item.closedDeals} cierres
                </div>
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
            {actionableInsights.length ? (
              actionableInsights.map((insight) => (
                <div
                  key={insight}
                  className="rounded-[22px] border border-ink/10 bg-white p-4 text-sm leading-7 text-ink/70"
                >
                  {insight}
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-ink/10 bg-white p-4 text-sm leading-7 text-ink/70">
                Aun no hay suficientes datos para sugerir acciones comerciales.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-pine">
            <BarChart3 className="h-4 w-4" />
            Calidad del inventario
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Que tan completos estan tus anuncios</h2>
          <p className="mt-2 text-sm text-ink/60">
            Mientras mas alto este bloque, mas facil sera convertir visitas en leads y ofertas.
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
            Detecta rapido que anuncio pulir primero para acelerar cierres.
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
            Estas publicaciones convierten mejor las vistas en conversaciones comerciales.
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
            Rendimiento del boost de visibilidad
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Impacto de tus publicaciones destacadas</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Boosts activos</div>
              <div className="mt-2 text-2xl font-semibold">{adPerformance.promotedListings}</div>
              <div className="mt-1 text-sm text-ink/60">publicaciones destacadas ahora mismo</div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Alcance estimado</div>
              <div className="mt-2 text-2xl font-semibold">
                {adPerformance.estimatedReach.toLocaleString(numberLocale)}
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

          <div className="mt-6 rounded-[24px] border border-ink/10 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/45">
              {boostCopy.surfaceEyebrow}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-ink">{boostCopy.surfaceTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-ink/60">{boostCopy.surfaceDescription}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {boostSurfaceCards.map((item) => (
                <div key={item.label} className="rounded-[22px] bg-mist p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/45">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-ink">
                    {Number(item.value || 0).toLocaleString(numberLocale)}
                  </div>
                  <div className="mt-1 text-sm text-ink/60">{item.helper}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-ink/10 bg-mist/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink/45">
                  {boostCopy.openRate}
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink">
                  {formatPercent(adPerformance.boostOpenRate)}
                </div>
              </div>
              <div className="rounded-[22px] border border-ink/10 bg-mist/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink/45">
                  {boostCopy.attributedLeadRate}
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink">
                  {formatPercent(adPerformance.attributedLeadRate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-2xl font-semibold">Leads y ofertas recientes</h2>
          <p className="mt-2 text-sm text-ink/60">
            Lo ultimo que entro por tus publicaciones para reaccionar rapido.
          </p>
          <div className="mt-5 space-y-5">
            <div>
              <div className="text-sm font-semibold text-ink">Leads recientes</div>
              <div className="mt-3 space-y-3">
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

            <div>
              <div className="text-sm font-semibold text-ink">Ofertas recientes</div>
              <div className="mt-3 space-y-3">
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

            <div>
              <div className="text-sm font-semibold text-ink">{boostCopy.byListingTitle}</div>
              <p className="mt-2 text-sm leading-6 text-ink/55">{boostCopy.byListingDescription}</p>
              <div className="mt-3 space-y-3">
                {boostedListingPerformance.length ? (
                  boostedListingPerformance.map((item) => (
                    <div key={item.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                      <div className="font-semibold text-ink">{item.label}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink/65">
                        <span className="data-pill">{boostCopy.home}: {item.homeImpressions}</span>
                        <span className="data-pill">{boostCopy.searchRail}: {item.searchRailImpressions}</span>
                        <span className="data-pill">{boostCopy.map}: {item.mapImpressions}</span>
                        <span className="data-pill">{boostCopy.cardOpens}: {item.cardOpens}</span>
                        <span className="data-pill">{boostCopy.leads}: {item.leads}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink/55">{boostCopy.emptyByListing}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
