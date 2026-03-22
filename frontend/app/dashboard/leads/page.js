"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CircleDot, Flame, MessageSquareMore } from "lucide-react";
import { getReceivedLeads, getSentLeads, updateLead } from "@/lib/api";
import { leadPriorityLabels, leadStatusLabels } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Textarea } from "@/components/ui/Textarea";

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const createDraftMap = (items = []) =>
  Object.fromEntries(
    items.map((lead) => [
      lead._id,
      {
        status: lead.status || "new",
        priority: lead.priority || "medium",
        internalNote: lead.internalNote || "",
        nextFollowUpAt: toDateInputValue(lead.nextFollowUpAt)
      }
    ])
  );

export default function DashboardLeadsPage() {
  const [received, setReceived] = useState(null);
  const [sent, setSent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingLeadId, setSavingLeadId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  const loadLeads = async () => {
    const [receivedData, sentData] = await Promise.all([getReceivedLeads(), getSentLeads()]);

    setReceived(receivedData.items || []);
    setSent(sentData.items || []);
    setSummary(receivedData.summary || null);
    setDrafts(createDraftMap(receivedData.items || []));
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredReceived = useMemo(() => {
    if (!received) return [];
    if (activeStatus === "all") return received;
    return received.filter((lead) => lead.status === activeStatus);
  }, [received, activeStatus]);

  const handleDraftChange = (leadId, patch) => {
    setDrafts((current) => ({
      ...current,
      [leadId]: {
        ...current[leadId],
        ...patch
      }
    }));
  };

  const handleSaveLead = async (leadId) => {
    const draft = drafts[leadId];
    if (!draft) return;

    setSavingLeadId(leadId);
    setFeedback("");

    try {
      await updateLead(leadId, {
        status: draft.status,
        priority: draft.priority,
        internalNote: draft.internalNote,
        nextFollowUpAt: draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : null
      });
      setFeedback("Lead actualizado correctamente.");
      await loadLeads();
    } catch (_error) {
      setFeedback("No fue posible guardar este lead.");
    } finally {
      setSavingLeadId("");
    }
  };

  const handleMarkContacted = async (leadId) => {
    const draft = drafts[leadId] || {};
    setSavingLeadId(leadId);
    setFeedback("");

    try {
      await updateLead(leadId, {
        status: "contacted",
        priority: draft.priority || "medium",
        internalNote: draft.internalNote || "",
        nextFollowUpAt: draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : null,
        lastContactedAt: new Date().toISOString()
      });
      setFeedback("Lead marcado como contactado.");
      await loadLeads();
    } catch (_error) {
      setFeedback("No fue posible marcar este lead.");
    } finally {
      setSavingLeadId("");
    }
  };

  if (!received || !sent || !summary) {
    return <LoadingState label="Cargando CRM de leads..." />;
  }

  const summaryCards = [
    { label: "Leads totales", value: summary.total, helper: "bandeja comercial" },
    { label: "Nuevos", value: summary.new, helper: "sin tocar todavia" },
    { label: "Alta prioridad", value: summary.highPriority, helper: "requieren atencion" },
    { label: "Seguimientos vencidos", value: summary.dueFollowUps, helper: "para hoy o antes" },
    { label: "Enfriandose", value: summary.stale, helper: "sin contacto reciente" }
  ];

  return (
    <div className="space-y-6">
      <section className="surface bg-hero-grid p-8">
        <span className="eyebrow">CRM de leads</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Bandeja comercial y seguimiento</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65">
          Prioriza contactos, programa seguimientos y guarda notas internas para no perder oportunidades.
        </p>
        {feedback ? (
          <div className="mt-4 rounded-2xl bg-pine/10 px-4 py-3 text-sm font-medium text-pine">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="surface p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-ink/40">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-ink">{card.value}</div>
            <div className="mt-2 text-sm text-ink/55">{card.helper}</div>
          </div>
        ))}
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Recibidos</span>
            <h2 className="mt-3 text-2xl font-semibold">Leads por trabajar</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "new", "contacted", "qualified", "closed"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeStatus === status
                    ? "bg-pine text-white"
                    : "bg-mist text-ink/70 hover:bg-white"
                }`}
              >
                {status === "all" ? "Todos" : leadStatusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredReceived.length ? (
            filteredReceived.map((lead) => {
              const draft = drafts[lead._id] || {};

              return (
                <div key={lead._id} className="rounded-[26px] border border-ink/10 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold text-ink">{lead.name}</div>
                        {draft.priority === "high" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                            <Flame className="h-3.5 w-3.5" />
                            Alta prioridad
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-sm text-ink/55">
                        {lead.property?.title} · {lead.email}
                        {lead.phone ? ` · ${lead.phone}` : ""}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink/55">
                        <span className="rounded-full bg-mist px-2.5 py-1">
                          Fuente: {lead.source || "property-page"}
                        </span>
                        <span className="rounded-full bg-mist px-2.5 py-1">
                          {new Date(lead.createdAt).toLocaleDateString("es-CR")}
                        </span>
                        {lead.property?._id ? (
                          <Link
                            href={`/properties/${lead.property.slug}`}
                            className="rounded-full bg-lagoon/10 px-2.5 py-1 font-semibold text-lagoon"
                          >
                            Ver propiedad
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                        Estado
                        <select
                          value={draft.status || "new"}
                          onChange={(event) =>
                            handleDraftChange(lead._id, { status: event.target.value })
                          }
                          className="mt-2 block w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                        >
                          {Object.entries(leadStatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                        Prioridad
                        <select
                          value={draft.priority || "medium"}
                          onChange={(event) =>
                            handleDraftChange(lead._id, { priority: event.target.value })
                          }
                          className="mt-2 block w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                        >
                          {Object.entries(leadPriorityLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[22px] bg-mist p-4 text-sm text-ink/75">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <MessageSquareMore className="h-4 w-4 text-pine" />
                      Mensaje del cliente
                    </div>
                    <p className="mt-2 leading-7">{lead.message}</p>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                        Nota interna
                      </label>
                      <Textarea
                        value={draft.internalNote || ""}
                        onChange={(event) =>
                          handleDraftChange(lead._id, { internalNote: event.target.value })
                        }
                        className="mt-2 min-h-[110px] bg-white"
                        placeholder="Resumen de llamada, objeciones, presupuesto, siguiente paso..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                        Seguimiento
                        <input
                          type="date"
                          value={draft.nextFollowUpAt || ""}
                          onChange={(event) =>
                            handleDraftChange(lead._id, { nextFollowUpAt: event.target.value })
                          }
                          className="mt-2 block w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                        />
                      </label>

                      <div className="rounded-[22px] border border-ink/10 bg-white p-4 text-sm text-ink/65">
                        <div className="flex items-center gap-2 font-semibold text-ink">
                          <CalendarClock className="h-4 w-4 text-lagoon" />
                          Estado CRM
                        </div>
                        <div className="mt-3 space-y-2">
                          <div>Ultimo contacto: {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString("es-CR") : "Aun no marcado"}</div>
                          <div>Siguiente paso: {draft.nextFollowUpAt || "Sin fecha"}</div>
                          <div>Mercado: {lead.property?.marketStatus || "available"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="success"
                      onClick={() => handleSaveLead(lead._id)}
                      disabled={savingLeadId === lead._id}
                    >
                      {savingLeadId === lead._id ? "Guardando..." : "Guardar CRM"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleMarkContacted(lead._id)}
                      disabled={savingLeadId === lead._id}
                    >
                      Marcar contactado hoy
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-ink/55">Aun no has recibido leads en esta bandeja.</p>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <span className="eyebrow">Enviados</span>
        <h2 className="mt-3 text-2xl font-semibold">Consultas que has hecho</h2>
        <div className="mt-6 space-y-4">
          {sent.length ? (
            sent.map((lead) => (
              <div key={lead._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{lead.property?.title}</div>
                    <div className="mt-1 text-sm text-ink/55">
                      Para {lead.toUser?.name} · {lead.email}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/65">
                    <CircleDot className="h-3.5 w-3.5" />
                    {leadStatusLabels[lead.status] || lead.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-ink/70">{lead.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">Aun no has enviado consultas.</p>
          )}
        </div>
      </section>
    </div>
  );
}
