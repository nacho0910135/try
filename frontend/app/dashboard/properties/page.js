"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPayPalBoostOrder,
  deleteProperty,
  getCommercialOverview,
  getMyProperties,
  updateProperty,
  updatePropertyFeatured
} from "@/lib/api";
import {
  formatCurrency,
  formatLocation,
  formatMarketStatus,
  formatPropertyStatus
} from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

const AUTO_SAVE_DELAY_MS = 700;

const buildDashboardDraftState = (item) => ({
  status:
    item.status === "sold" || item.status === "rented" ? "published" : item.status || "draft",
  marketStatus:
    item.marketStatus && item.marketStatus !== "available"
      ? item.marketStatus
      : item.status === "sold"
        ? "sold"
        : item.status === "rented"
          ? "rented"
          : item.marketStatus || "available"
});

const areDraftStatesEqual = (first, second) =>
  first?.status === second?.status && first?.marketStatus === second?.marketStatus;

function DashboardPropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [draftStates, setDraftStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState("");
  const [featuredPropertyId, setFeaturedPropertyId] = useState("");
  const [rowFeedback, setRowFeedback] = useState({});
  const [autoSaveStateById, setAutoSaveStateById] = useState({});
  const [commercialOverview, setCommercialOverview] = useState(null);
  const autoSaveTimersRef = useRef({});
  const autoSaveInFlightRef = useRef({});
  const itemsRef = useRef([]);
  const draftStatesRef = useRef({});

  const loadProperties = async () => {
    try {
      const data = await getMyProperties();
      const nextItems = data.items || [];
      const nextDraftStates = Object.fromEntries(
        nextItems.map((item) => [item._id, buildDashboardDraftState(item)])
      );
      itemsRef.current = nextItems;
      draftStatesRef.current = nextDraftStates;
      setItems(nextItems);
      setDraftStates(nextDraftStates);
    } finally {
      setLoading(false);
    }
  };

  const loadCommercialOverview = async () => {
    try {
      const data = await getCommercialOverview();
      setCommercialOverview(data.overview);
    } catch (_error) {
      setCommercialOverview(null);
    }
  };

  useEffect(() => {
    loadProperties();
    loadCommercialOverview();
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    draftStatesRef.current = draftStates;
  }, [draftStates]);

  useEffect(() => {
    const timersRef = autoSaveTimersRef;

    return () => {
      Object.values(timersRef.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const flash = window.sessionStorage.getItem("alquiventascr-property-flash");
    const paypalStatus = searchParams.get("paypal");

    if (paypalStatus === "boost-success") {
      setFlashMessage("El pago se confirmo y tu boost de visibilidad ya esta activo.");
    } else if (paypalStatus === "boost-cancelled") {
      setFlashMessage("El checkout PayPal fue cancelado. Tu propiedad sigue organica.");
    } else if (paypalStatus === "boost-error") {
      setFlashMessage("No pudimos confirmar el pago PayPal. Intenta de nuevo.");
    }

    if (!flash && !searchParams.get("saved") && !paypalStatus) {
      return;
    }

    if (!paypalStatus) {
      setFlashMessage(flash || "Tu publicacion fue guardada correctamente.");
    }
    window.sessionStorage.removeItem("alquiventascr-property-flash");

    if (searchParams.get("saved") || paypalStatus) {
      const timeout = setTimeout(() => {
        router.replace("/dashboard/properties", { scroll: false });
      }, 1200);

      return () => clearTimeout(timeout);
    }
  }, [router, searchParams]);

  const setAutoSaveState = (propertyId, nextState) => {
    setAutoSaveStateById((current) => {
      const next = { ...current };

      if (nextState) {
        next[propertyId] = nextState;
      } else {
        delete next[propertyId];
      }

      return next;
    });
  };

  const clearAutoSaveTimer = (propertyId) => {
    const timer = autoSaveTimersRef.current[propertyId];

    if (!timer) {
      return;
    }

    window.clearTimeout(timer);
    delete autoSaveTimersRef.current[propertyId];
  };

  const hasDraftChanges = (propertyId, draft = draftStatesRef.current[propertyId]) => {
    const currentItem = itemsRef.current.find((item) => item._id === propertyId);

    if (!currentItem || !draft) {
      return false;
    }

    return !areDraftStatesEqual(draft, buildDashboardDraftState(currentItem));
  };

  const persistDraftState = async (propertyId) => {
    if (autoSaveInFlightRef.current[propertyId]) {
      return;
    }

    const draft = draftStatesRef.current[propertyId];

    if (!draft || !hasDraftChanges(propertyId, draft)) {
      setAutoSaveState(propertyId, "");
      setRowFeedback((current) => {
        if (!current[propertyId]) {
          return current;
        }

        const next = { ...current };
        delete next[propertyId];
        return next;
      });
      return;
    }

    autoSaveInFlightRef.current[propertyId] = true;
    setAutoSaveState(propertyId, "saving");
    setRowFeedback((current) => ({
      ...current,
      [propertyId]: {
        tone: "info",
        message: "Guardando cambios automaticamente..."
      }
    }));

    const sentDraft = { ...draft };
    let shouldPersistLatestDraft = false;

    try {
      await updateProperty(propertyId, {
        status: sentDraft.status,
        marketStatus: sentDraft.marketStatus
      });

      shouldPersistLatestDraft = !areDraftStatesEqual(draftStatesRef.current[propertyId], sentDraft);

      if (shouldPersistLatestDraft) {
        clearAutoSaveTimer(propertyId);
        setAutoSaveState(propertyId, "pending");
        setRowFeedback((current) => ({
          ...current,
          [propertyId]: {
            tone: "info",
            message: "Se detectaron nuevos cambios. Guardando de nuevo..."
          }
        }));
        return;
      }

      await Promise.all([loadProperties(), loadCommercialOverview()]);
      setAutoSaveState(propertyId, "saved");
      setRowFeedback((current) => ({
        ...current,
        [propertyId]: {
          tone: "success",
          message: "Estado actualizado automaticamente."
        }
      }));
    } catch (error) {
      setAutoSaveState(propertyId, "error");
      setRowFeedback((current) => ({
        ...current,
        [propertyId]: {
          tone: "error",
          message:
            error.response?.data?.message ||
            "No se pudo guardar el cambio automaticamente."
        }
      }));
    } finally {
      autoSaveInFlightRef.current[propertyId] = false;

      if (shouldPersistLatestDraft) {
        void persistDraftState(propertyId);
      }
    }
  };

  const scheduleAutoSave = (propertyId) => {
    clearAutoSaveTimer(propertyId);
    setAutoSaveState(propertyId, "pending");
    setRowFeedback((current) => ({
      ...current,
      [propertyId]: {
        tone: "info",
        message: "Cambio detectado. Guardando automaticamente..."
      }
    }));

    autoSaveTimersRef.current[propertyId] = window.setTimeout(() => {
      delete autoSaveTimersRef.current[propertyId];

      if (autoSaveInFlightRef.current[propertyId]) {
        return;
      }

      void persistDraftState(propertyId);
    }, AUTO_SAVE_DELAY_MS);
  };

  const handleDraftChange = (propertyId, key, value) => {
    setDraftStates((current) => {
      const next = {
        ...current,
        [propertyId]: {
          ...(current[propertyId] || {}),
          [key]: value
        }
      };
      draftStatesRef.current = next;
      return next;
    });
    scheduleAutoSave(propertyId);
  };

  const handleToggleFeatured = async (item) => {
    try {
      setFeaturedPropertyId(item._id);

      if (!item.featured) {
        const data = await createPayPalBoostOrder({ propertyId: item._id });
        window.location.href = data.order.approvalUrl;
        return;
      }

      await updatePropertyFeatured(item._id, false);
      setRowFeedback((current) => ({
        ...current,
        [item._id]: {
          tone: "success",
          message: item.featured
            ? "El boost de visibilidad fue removido."
            : "Redirigiendo a PayPal..."
        }
      }));
      setFlashMessage(
        item.featured
          ? "Quitaste una propiedad del bloque de destacados."
          : "Te estamos enviando a PayPal para activar el boost."
      );
      if (item.featured) {
        await Promise.all([loadProperties(), loadCommercialOverview()]);
      }
    } catch (error) {
      setRowFeedback((current) => ({
        ...current,
        [item._id]: {
          tone: "error",
          message:
            error.response?.data?.message || "No se pudo actualizar el destacado de la propiedad."
        }
      }));
      setFlashMessage(
        error.response?.data?.message || "No se pudo actualizar el destacado de la propiedad."
      );
    } finally {
      setFeaturedPropertyId("");
    }
  };

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm("Deseas eliminar esta propiedad?");
    if (!confirmed) return;
    clearAutoSaveTimer(propertyId);
    await deleteProperty(propertyId);
    await Promise.all([loadProperties(), loadCommercialOverview()]);
  };

  const getAttentionCopy = (level) => {
    if (level === "urgent") {
      return {
        label: "Urgente",
        className: "text-terracotta"
      };
    }

    if (level === "healthy") {
      return {
        label: "Saludable",
        className: "text-pine"
      };
    }

    return {
      label: "Observar",
      className: "text-lagoon"
    };
  };

  const getModerationCopy = (signals = {}) => {
    if (signals.reviewStatus === "review") {
      return {
        label: "Revisar",
        className: "text-red-600"
      };
    }

    if (signals.reviewStatus === "watch") {
      return {
        label: "Observar",
        className: "text-terracotta"
      };
    }

    return {
      label: "Limpia",
      className: "text-pine"
    };
  };

  const formatFlagLabel = (value = "") =>
    String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  if (loading) {
    return <LoadingState label="Cargando propiedades..." />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Todavia no has publicado propiedades"
        description="Crea tu primer anuncio y empieza a recibir leads desde el mapa y el listado."
        actionLabel="Crear propiedad"
        onAction={() => (window.location.href = "/dashboard/properties/new")}
      />
    );
  }

  return (
    <section className="surface p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Publicaciones</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold">Mis propiedades</h1>
          <p className="mt-3 text-sm text-ink/60">
            Las propiedades en estado <strong>Publicado</strong> ya aparecen en el buscador y los
            cambios de estado se guardan automaticamente.
          </p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>Nueva propiedad</Button>
        </Link>
      </div>

      {commercialOverview?.summary ? (
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-pine/15 bg-pine/8 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-pine/75">Modelo activo</div>
            <div className="mt-2 text-lg font-semibold text-ink">Publicacion gratuita</div>
            <div className="mt-1 text-sm text-ink/60">
              Publica gratis y usa destacados como boost de visibilidad.
            </div>
          </div>
          <div className="rounded-[24px] border border-ink/10 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Propiedades activas</div>
            <div className="mt-2 text-2xl font-semibold text-ink">
              {commercialOverview.summary.activeListings}
            </div>
            <div className="mt-1 text-sm text-ink/60">
              {commercialOverview.summary.totalListings} publicaciones totales
            </div>
          </div>
          <div className="rounded-[24px] border border-ink/10 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Boosts activos</div>
            <div className="mt-2 text-2xl font-semibold text-ink">
              {commercialOverview.adPerformance?.promotedListings || 0}
            </div>
            <div className="mt-1 text-sm text-ink/60">
              {commercialOverview.summary.totalLeads || 0} leads generados
            </div>
          </div>
          <div className="rounded-[24px] border border-ink/10 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Siguiente foco</div>
            <div className="mt-2 text-sm font-semibold text-ink">
              Revisa visualizaciones, leads y ofertas para decidir que propiedad conviene impulsar.
            </div>
            <div className="mt-3">
              <Link href="/dashboard/business">
                <Button variant="secondary" className="w-full">
                  Ver visibilidad y metricas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {flashMessage ? (
        <div className="mb-6 rounded-2xl border border-pine/20 bg-pine/10 px-4 py-3 text-sm font-medium text-pine">
          {flashMessage}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-ink/45">
            <tr>
              <th className="pb-4">Propiedad</th>
              <th className="pb-4">Ubicacion</th>
              <th className="pb-4">Precio</th>
              <th className="pb-4">Visualizaciones</th>
              <th className="pb-4">Salud</th>
              <th className="pb-4">Estado</th>
              <th className="pb-4">Mercado</th>
              <th className="pb-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b border-ink/5 align-top">
                <td className="py-4 pr-4">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-ink/45">
                    {item.propertyType} {item.featured ? "- Con boost" : "- Organica"}
                  </div>
                  {item.trustProfile?.score ? (
                    <div className="mt-2 text-xs text-ink/55">
                      Calidad del anuncio {item.trustProfile.score}/100
                    </div>
                  ) : null}
                  {item.moderationSignals?.duplicateCandidateCount ? (
                    <div className="mt-2 text-xs font-semibold text-terracotta">
                      Posible duplicado con {item.moderationSignals.duplicateCandidateCount} anuncio(s)
                    </div>
                  ) : null}
                </td>
                <td className="py-4 pr-4 text-ink/65">{formatLocation(item)}</td>
                <td className="py-4 pr-4">{formatCurrency(item.price, item.currency)}</td>
                <td className="py-4 pr-4">
                  <div className="font-semibold">{item.views || item.engagement?.views || 0}</div>
                  <div className="text-xs text-ink/45">vistas publicas</div>
                  <div className="mt-1 text-xs text-ink/55">
                    {item.engagement?.favorites || 0} fav - {item.engagement?.leads || 0} leads -{" "}
                    {item.engagement?.offers || 0} ofertas
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <div className="font-semibold">
                    {item.listingInsights?.completenessScore || 0}/100
                  </div>
                  <div
                    className={`mt-1 text-xs font-semibold ${
                      getAttentionCopy(item.listingInsights?.attentionLevel).className
                    }`}
                  >
                    {getAttentionCopy(item.listingInsights?.attentionLevel).label}
                  </div>
                  <div className="mt-1 max-w-[220px] text-xs leading-5 text-ink/55">
                    {item.listingInsights?.actionItems?.[0] ||
                      item.listingInsights?.strengths?.[0] ||
                      "Sin acciones prioritarias por ahora."}
                  </div>
                  <div
                    className={`mt-2 text-xs font-semibold ${
                      getModerationCopy(item.moderationSignals).className
                    }`}
                  >
                    {getModerationCopy(item.moderationSignals).label}
                  </div>
                  {item.moderationSignals?.suspiciousFlags?.length ? (
                    <div className="mt-1 max-w-[220px] text-xs leading-5 text-ink/55">
                      Flags:{" "}
                      {item.moderationSignals.suspiciousFlags
                        .slice(0, 2)
                        .map(formatFlagLabel)
                        .join(", ")}
                    </div>
                  ) : null}
                </td>
                <td className="py-4 pr-4">
                  <select
                    value={draftStates[item._id]?.status || item.status}
                    onChange={(event) => handleDraftChange(item._id, "status", event.target.value)}
                    className="rounded-xl border border-ink/10 px-3 py-2"
                  >
                    {["draft", "published", "paused"].map((status) => (
                      <option key={status} value={status}>
                        {formatPropertyStatus(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 pr-4">
                  <select
                    value={draftStates[item._id]?.marketStatus || item.marketStatus || "available"}
                    onChange={(event) =>
                      handleDraftChange(item._id, "marketStatus", event.target.value)
                    }
                    className="rounded-xl border border-ink/10 px-3 py-2"
                  >
                    {["available", "reserved", "sold", "rented", "inactive"].map((marketStatus) => (
                      <option key={marketStatus} value={marketStatus}>
                        {formatMarketStatus(marketStatus)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={item.featured ? "success" : "secondary"}
                      onClick={() => handleToggleFeatured(item)}
                      disabled={
                        featuredPropertyId === item._id ||
                        ["pending", "saving"].includes(autoSaveStateById[item._id]) ||
                        (!item.featured && !commercialOverview?.billing?.configured) ||
                        (!item.featured &&
                          (item.status !== "published" ||
                            !["available", "reserved"].includes(item.marketStatus || "available")))
                      }
                    >
                      {featuredPropertyId === item._id
                        ? "Actualizando..."
                        : item.featured
                          ? "Quitar boost"
                          : !commercialOverview?.billing?.configured
                            ? "Configura PayPal"
                            : `Pagar boost${
                                commercialOverview?.billing?.boost?.price
                                  ? ` (${formatCurrency(
                                      commercialOverview.billing.boost.price,
                                      commercialOverview.billing.boost.currency
                                    )})`
                                  : ""
                              }`}
                    </Button>
                    <Link href={`/dashboard/properties/${item._id}/edit`}>
                      <Button variant="secondary">Editar</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(item._id)}
                      disabled={["pending", "saving"].includes(autoSaveStateById[item._id])}
                    >
                      Eliminar
                    </Button>
                  </div>
                  {rowFeedback[item._id] ? (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        rowFeedback[item._id].tone === "success"
                          ? "text-pine"
                          : rowFeedback[item._id].tone === "info"
                            ? "text-lagoon"
                          : "text-red-600"
                      }`}
                    >
                      {rowFeedback[item._id].message}
                    </p>
                  ) : null}
                  {!item.featured &&
                  (item.status !== "published" ||
                    !["available", "reserved"].includes(item.marketStatus || "available")) ? (
                    <p className="mt-2 text-xs text-ink/50">
                      Solo publicaciones publicadas y disponibles o reservadas pueden recibir boost.
                    </p>
                  ) : null}
                  {!item.featured && commercialOverview?.billing?.configured ? (
                    <p className="mt-2 text-xs text-ink/50">
                      El boost se cobra con PayPal y se activa en cuanto el pago se confirme.
                      Aparece antes del bloque organico, entra al modulo destacado y resalta en el
                      mapa con burbuja premium.{" "}
                      <Link href="/destacadas" className="font-semibold text-pine hover:text-lagoon">
                        Ver vitrina boost
                      </Link>
                    </p>
                  ) : null}
                  {item.featured ? (
                    <p className="mt-2 text-xs text-pine">
                      Este anuncio ya tiene visibilidad extra en buscador, destacados y mapa.{" "}
                      <Link href="/destacadas" className="font-semibold hover:text-lagoon">
                        Abrir vitrina boost
                      </Link>
                    </p>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DashboardPropertiesPage() {
  return (
    <Suspense fallback={<LoadingState label="Cargando propiedades..." />}>
      <DashboardPropertiesPageContent />
    </Suspense>
  );
}
