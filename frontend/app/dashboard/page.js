"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  CalendarClock,
  Radar,
  Sparkles,
  Target
} from "lucide-react";
import { getDashboardSummary, requestUserVerification } from "@/lib/api";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

const leadStatusLabels = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  closed: "Cerrado"
};

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [verificationType, setVerificationType] = useState(
    user?.role === "agent" ? "agent-license" : user?.role === "owner" ? "owner" : "identity"
  );
  const [verificationNote, setVerificationNote] = useState("");
  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [verificationSaving, setVerificationSaving] = useState(false);

  const loadSummary = async () => {
    const data = await getDashboardSummary();
    setSummary(data.summary);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (!summary) {
    return <LoadingState label={t("dashboardPage.loading")} />;
  }

  const cards = [
    {
      label: "Propiedades activas",
      value: summary.activeProperties,
      helper: `${summary.properties} en total`,
      href: "/dashboard/properties"
    },
    {
      label: "Visualizaciones",
      value: summary.totalViews?.toLocaleString("es-CR") || 0,
      helper: "trafico acumulado",
      href: "/dashboard/business"
    },
    {
      label: "Leads recibidos",
      value: summary.leadsReceived,
      helper: `${summary.totalLeadsOnListings || 0} en tus anuncios`,
      href: "/dashboard/leads"
    },
    {
      label: "Ofertas recibidas",
      value: summary.offersReceived || 0,
      helper: `${summary.totalOffersOnListings || 0} en tus anuncios`,
      href: "/dashboard/offers"
    }
  ];

  const verification = summary.verification || {};
  const alertCenter = summary.alertCenter || {};
  const verificationToneClass =
    verification.status === "verified"
      ? "border-pine/20 bg-pine/10 text-pine"
      : verification.status === "pending"
        ? "border-lagoon/20 bg-lagoon/10 text-lagoon"
        : verification.status === "rejected"
          ? "border-terracotta/20 bg-terracotta/10 text-terracotta"
          : "border-ink/10 bg-white text-ink/70";
  const verificationLabel =
    verification.status === "verified"
      ? "Verificacion aprobada"
      : verification.status === "pending"
        ? "Solicitud en revision"
        : verification.status === "rejected"
          ? "Solicitud rechazada"
          : "Sin verificacion activa";

  const handleVerificationRequest = async () => {
    try {
      setVerificationSaving(true);
      const data = await requestUserVerification({
        requestedType: verificationType,
        requestNote: verificationNote
      });
      setUser(data.user);
      setVerificationFeedback("Tu solicitud fue enviada correctamente al panel admin.");
      await loadSummary();
    } catch (error) {
      setVerificationFeedback(
        error.response?.data?.message || "No fue posible enviar la solicitud de verificacion."
      );
    } finally {
      setVerificationSaving(false);
    }
  };

  return (
    <>
      <section className="surface bg-hero-grid p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <span className="eyebrow">{t("dashboardPage.eyebrow")}</span>
            <h1 className="mt-4 font-serif text-4xl font-semibold">
              {t("dashboardPage.greeting", {
                name: user?.name?.split(" ")[0] || t("dashboardPage.fallbackName")
              })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-ink/65">
              {t("dashboardPage.description")}
            </p>
          </div>
          <div className="rounded-[26px] border border-pine/15 bg-white/85 p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-pine/75">Plan actual</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{summary.plan?.label || "Gratis"}</div>
            <div className="mt-1 text-sm text-ink/60">
              {summary.plan?.status === "trial" ? "Prueba activa" : "Activo"} -{" "}
              {formatCurrency(summary.plan?.monthlyPrice || 0, "USD")} / mes
            </div>
            <div className="mt-4 text-sm text-ink/70">
              {summary.planUsage?.activeListings || 0}/{summary.plan?.propertyLimit || 1} propiedades activas -{" "}
              {summary.planUsage?.promotedListings || 0}/{summary.plan?.promotedSlots || 0} destacados en uso
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="surface p-6 transition hover:-translate-y-1">
            <div className="text-sm uppercase tracking-[0.18em] text-ink/40">{card.label}</div>
            <div className="mt-4 text-4xl font-semibold">{card.value}</div>
            <div className="mt-2 text-sm text-ink/55">{card.helper}</div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
              {t("dashboardPage.viewDetails")}
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-terracotta">
            <BellRing className="h-4 w-4" />
            Alertas visibles
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Lo que requiere atencion hoy</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            Tienes <strong>{alertCenter.newSearchMatches || 0}</strong> novedades en busquedas guardadas y{" "}
            <strong>{alertCenter.dueLeadActions || 0}</strong> leads que conviene mover hoy.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] bg-mist p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lagoon">
                <Radar className="h-4 w-4" />
                Busquedas
              </div>
              <div className="mt-3 text-3xl font-semibold text-ink">
                {alertCenter.newSearchMatches || 0}
              </div>
              <div className="mt-1 text-sm text-ink/60">nuevas coincidencias detectadas</div>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
                <CalendarClock className="h-4 w-4" />
                Leads
              </div>
              <div className="mt-3 text-3xl font-semibold text-ink">
                {alertCenter.dueLeadActions || 0}
              </div>
              <div className="mt-1 text-sm text-ink/60">acciones comerciales pendientes</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/saved-searches">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
                Abrir alertas de busqueda
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/dashboard/leads">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
                Abrir CRM de leads
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        <div className="surface p-6">
          <Target className="h-5 w-5 text-terracotta" />
          <h2 className="mt-4 text-2xl font-semibold">Embudo comercial</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            Tu tasa actual de conversion es de <strong>{summary.conversionRate || 0}%</strong>. Usa el panel de negocio para ver que anuncios convierten mejor en leads y ofertas.
          </p>
          <Link href="/dashboard/business" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
            Abrir negocio y publicidad
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="surface p-6">
          <Sparkles className="h-5 w-5 text-lagoon" />
          <h2 className="mt-4 text-2xl font-semibold">Inventario y visibilidad</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            Tienes {summary.featuredProperties || 0} publicaciones destacadas y te quedan{" "}
            {summary.planUsage?.remainingPromotedSlots || 0} espacios premium libres. Ese es el bloque que mas
            valor te conviene potenciar cuando busques mas leads y cierres.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/dashboard/properties">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
                Revisar propiedades
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
            <Radar className="h-4 w-4" />
            Radar de busquedas
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Alertas destacadas</h2>
          <div className="mt-5 space-y-3">
            {alertCenter.highlightedSearches?.length ? (
              alertCenter.highlightedSearches.map((item) => (
                <div key={item._id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{item.name}</div>
                      <div className="mt-1 text-sm text-ink/55">
                        {item.newMatches} nuevas · {item.totalMatches} activas
                      </div>
                    </div>
                    {item.alertsEnabled ? (
                      <span className="rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                        Activa
                      </span>
                    ) : (
                      <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/65">
                        Seguimiento manual
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/55">
                Todavia no hay busquedas con novedades visibles en este momento.
              </p>
            )}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-pine">
            <CalendarClock className="h-4 w-4" />
            Seguimiento comercial
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Leads que conviene mover ya</h2>
          <div className="mt-5 space-y-3">
            {alertCenter.dueLeadActions?.length ? (
              alertCenter.dueLeadActions.map((lead) => (
                <div key={lead._id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{lead.name}</div>
                      <div className="mt-1 text-sm text-ink/55">{lead.propertyTitle}</div>
                      <div className="mt-2 text-xs text-ink/55">
                        {lead.nextFollowUpAt
                          ? `Seguimiento: ${new Date(lead.nextFollowUpAt).toLocaleDateString("es-CR")}`
                          : lead.lastContactedAt
                            ? `Ultimo contacto: ${new Date(lead.lastContactedAt).toLocaleDateString("es-CR")}`
                            : `Ingreso: ${new Date(lead.createdAt).toLocaleDateString("es-CR")}`}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          lead.priority === "high"
                            ? "bg-red-50 text-red-600"
                            : lead.priority === "low"
                              ? "bg-mist text-ink/65"
                              : "bg-lagoon/10 text-lagoon"
                        }`}
                      >
                        {lead.priority === "high"
                          ? "Alta"
                          : lead.priority === "low"
                            ? "Baja"
                            : "Media"}
                      </span>
                      <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/65">
                        {leadStatusLabels[lead.status] || lead.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/55">
                No hay leads vencidos o de alta prioridad por ahora.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-pine">
              <BadgeCheck className="h-4 w-4" />
              Verificacion publica
            </div>
            <h2 className="mt-3 text-2xl font-semibold">Haz que tu perfil inspire mas confianza</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Los perfiles verificados transmiten mas seguridad al comprador o inquilino y refuerzan los badges publicos del anuncio.
            </p>
          </div>
          <div className={`rounded-[24px] border px-5 py-4 text-sm font-semibold ${verificationToneClass}`}>
            {verificationLabel}
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] bg-mist p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Badge solicitado</div>
            <div className="mt-2 text-2xl font-semibold text-ink">
              {verification.requestedBadge || "Cuenta verificada"}
            </div>
            <div className="mt-3 text-sm leading-7 text-ink/65">
              {verification.status === "verified"
                ? "Tu perfil ya puede mostrarse como verificado en las fichas y reforzar la confianza del anuncio."
                : verification.status === "pending"
                  ? "Tu solicitud esta siendo revisada por administracion."
                  : verification.status === "rejected"
                    ? `Admin te dejo esta nota: ${verification.reviewNote || "Sin comentario adicional."}`
                    : "Solicita verificacion para aumentar confianza, sobre todo si publicas como agente o propietario."}
            </div>
          </div>

          <div className="rounded-[24px] border border-ink/10 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Tipo de verificacion</span>
                <select
                  value={verificationType}
                  onChange={(event) => setVerificationType(event.target.value)}
                  className="field-input"
                  disabled={verificationSaving}
                >
                  <option value="identity">Cuenta verificada</option>
                  <option value="owner">Propietario verificado</option>
                  <option value="agent-license">Agente verificado</option>
                  <option value="broker">Broker verificado</option>
                </select>
              </label>
              <div className="rounded-[20px] bg-mist px-4 py-3 text-sm leading-7 text-ink/65">
                Recomendado: si publicas varias propiedades como profesional, pide agente o broker verificado.
              </div>
            </div>

            <label className="mt-4 block">
              <span className="field-label">Nota para admin</span>
              <textarea
                value={verificationNote}
                onChange={(event) => setVerificationNote(event.target.value)}
                className="field-input min-h-[110px]"
                placeholder="Ejemplo: soy agente de bienes raices en Escazu y publico inventario propio y de clientes."
                disabled={verificationSaving}
              />
            </label>

            {verificationFeedback ? (
              <div className="mt-4 rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">
                {verificationFeedback}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="success"
                onClick={handleVerificationRequest}
                disabled={verificationSaving}
              >
                {verificationSaving
                  ? "Enviando solicitud..."
                  : verification.status === "pending"
                    ? "Actualizar solicitud"
                    : "Solicitar verificacion"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
