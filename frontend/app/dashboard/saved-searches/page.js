"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, BellRing, Radar, Sparkles } from "lucide-react";
import {
  deleteSavedSearch,
  getSavedSearches,
  sendSavedSearchAlert,
  updateSavedSearch
} from "@/lib/api";
import { serializePropertyQuery } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardSavedSearchesPage() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadSavedSearches = async () => {
    const data = await getSavedSearches();
    setItems(data.items || []);
  };

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const handleDelete = async (searchId) => {
    setBusyId(searchId);
    setFeedback("");

    try {
      await deleteSavedSearch(searchId);
      setFeedback("Busqueda guardada eliminada.");
      await loadSavedSearches();
    } finally {
      setBusyId("");
    }
  };

  const handleToggleAlerts = async (item) => {
    setBusyId(item._id);
    setFeedback("");

    try {
      await updateSavedSearch(item._id, {
        alertsEnabled: !item.alertsEnabled
      });
      setFeedback(
        !item.alertsEnabled
          ? "Alertas activadas para esta busqueda."
          : "Alertas desactivadas para esta busqueda."
      );
      await loadSavedSearches();
    } finally {
      setBusyId("");
    }
  };

  const handleOpenSearch = async (item) => {
    setBusyId(item._id);
    setFeedback("");

    try {
      await updateSavedSearch(item._id, {
        lastViewedAt: new Date().toISOString()
      });
    } catch (_error) {
      // If this lightweight mark fails, we still let the user continue.
    } finally {
      setBusyId("");
      router.push(`/search?${serializePropertyQuery(item.filters || {})}`);
    }
  };

  const handleSendAlertEmail = async (item) => {
    setBusyId(item._id);
    setFeedback("");

    try {
      const data = await sendSavedSearchAlert(item._id);
      const mode = data.result?.email?.mode;
      setFeedback(
        mode === "smtp"
          ? "Alerta enviada por correo correctamente."
          : "Alerta preparada en modo desarrollo. Configura SMTP para enviarla de verdad."
      );
      await loadSavedSearches();
    } catch (error) {
      setFeedback(
        error.response?.data?.message || "No se pudo enviar la alerta por correo ahora mismo."
      );
    } finally {
      setBusyId("");
    }
  };

  if (!items) {
    return <LoadingState label="Cargando alertas de busqueda..." />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No tienes busquedas guardadas"
        description="Ve a Explorar, ajusta filtros o dibuja una zona en el mapa y guardala desde arriba."
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="surface bg-hero-grid p-8">
        <span className="eyebrow">Alertas y seguimiento</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Busquedas guardadas con radar</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65">
          Activa alertas, detecta coincidencias nuevas y vuelve rapido a las zonas que sigues.
        </p>
        {feedback ? (
          <div className="mt-4 rounded-2xl bg-pine/10 px-4 py-3 text-sm font-medium text-pine">
            {feedback}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xl font-semibold text-ink">{item.name}</div>
                  {item.alertsEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                      <BellRing className="h-3.5 w-3.5" />
                      Alertas activas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/65">
                      <Bell className="h-3.5 w-3.5" />
                      Alertas apagadas
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-ink/55">
                  {Object.entries(item.filters || {})
                    .filter(([, value]) => value !== null && value !== undefined && value !== "")
                    .map(([key, value]) => `${key}: ${typeof value === "object" ? "mapa" : value}`)
                    .join(" · ")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={item.alertsEnabled ? "secondary" : "success"}
                  onClick={() => handleToggleAlerts(item)}
                  disabled={busyId === item._id}
                >
                  {item.alertsEnabled ? "Silenciar alertas" : "Activar alertas"}
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleSendAlertEmail(item)}
                  disabled={busyId === item._id}
                >
                  Enviar email ahora
                </Button>
                <Button
                  variant="accent"
                  onClick={() => handleOpenSearch(item)}
                  disabled={busyId === item._id}
                >
                  Abrir
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(item._id)}
                  disabled={busyId === item._id}
                >
                  Eliminar
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="rounded-[22px] border border-pine/12 bg-pine/8 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
                    <Radar className="h-4 w-4" />
                    Radar actual
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-ink">
                    {item.alertPreview?.totalMatches || 0}
                  </div>
                  <div className="mt-1 text-sm text-ink/60">propiedades coinciden hoy</div>
                </div>

                <div className="rounded-[22px] border border-lagoon/12 bg-lagoon/8 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lagoon">
                    <Sparkles className="h-4 w-4" />
                    Novedades
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-ink">
                    {item.alertPreview?.newMatches || 0}
                  </div>
                  <div className="mt-1 text-sm text-ink/60">
                    nuevas desde la ultima vez que abriste esta busqueda
                  </div>
                </div>

                <div className="rounded-[22px] border border-terracotta/12 bg-terracotta/8 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">
                    <BellRing className="h-4 w-4" />
                    Email
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-ink">
                    {item.alertPreview?.emailMatches || 0}
                  </div>
                  <div className="mt-1 text-sm text-ink/60">
                    nuevas desde el ultimo correo enviado
                  </div>
                  <div className="mt-2 text-xs text-ink/55">
                    {item.lastAlertSentAt
                      ? `Ultimo email: ${new Date(item.lastAlertSentAt).toLocaleDateString("es-CR")}`
                      : "Todavia no se ha enviado un correo"}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Coincidencias recientes</div>
                    <div className="mt-1 text-sm text-ink/55">
                      Vista rapida del inventario actual para esta alerta.
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {item.alertPreview?.recentMatches?.length ? (
                    item.alertPreview.recentMatches.map((property) => (
                      <div
                        key={property._id}
                        className="rounded-[20px] border border-ink/10 bg-mist p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-ink">{property.title}</div>
                            <div className="mt-1 text-sm text-ink/55">
                              {property.address?.district}, {property.address?.canton},{" "}
                              {property.address?.province}
                            </div>
                          </div>
                          <Link
                            href={`/properties/${property.slug}`}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pine shadow-soft"
                          >
                            Ver
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ink/55">
                      No hay coincidencias activas en este momento para esta busqueda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
