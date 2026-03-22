"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteProperty, getMyProperties, updateProperty } from "@/lib/api";
import {
  formatCurrency,
  formatLocation,
  formatMarketStatus,
  formatPropertyStatus
} from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardPropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [draftStates, setDraftStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState("");
  const [savingPropertyId, setSavingPropertyId] = useState("");
  const [rowFeedback, setRowFeedback] = useState({});

  const loadProperties = async () => {
    try {
      const data = await getMyProperties();
      const nextItems = data.items || [];
      setItems(nextItems);
      setDraftStates(
        Object.fromEntries(
          nextItems.map((item) => [
            item._id,
            {
              status:
                item.status === "sold" || item.status === "rented"
                  ? "published"
                  : item.status || "draft",
              marketStatus:
                item.marketStatus && item.marketStatus !== "available"
                  ? item.marketStatus
                  : item.status === "sold"
                    ? "sold"
                    : item.status === "rented"
                      ? "rented"
                      : item.marketStatus || "available"
            }
          ])
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const flash = window.sessionStorage.getItem("alquiventascr-property-flash");

    if (!flash && !searchParams.get("saved")) {
      return;
    }

    setFlashMessage(flash || "Tu publicacion fue guardada correctamente.");
    window.sessionStorage.removeItem("alquiventascr-property-flash");

    if (searchParams.get("saved")) {
      const timeout = setTimeout(() => {
        router.replace("/dashboard/properties", { scroll: false });
      }, 1200);

      return () => clearTimeout(timeout);
    }
  }, [router, searchParams]);

  const handleDraftChange = (propertyId, key, value) => {
    setDraftStates((current) => ({
      ...current,
      [propertyId]: {
        ...(current[propertyId] || {}),
        [key]: value
      }
    }));
  };

  const handleSaveStatus = async (propertyId) => {
    const draft = draftStates[propertyId];

    if (!draft) {
      return;
    }

    try {
      setSavingPropertyId(propertyId);
      await updateProperty(propertyId, {
        status: draft.status,
        marketStatus: draft.marketStatus
      });
      setFlashMessage("El estado de la propiedad se actualizo correctamente.");
      setRowFeedback((current) => ({
        ...current,
        [propertyId]: {
          tone: "success",
          message: "Estado guardado correctamente."
        }
      }));
      await loadProperties();
    } catch (error) {
      setFlashMessage(
        error.response?.data?.message || "No se pudo actualizar el estado de la propiedad."
      );
      setRowFeedback((current) => ({
        ...current,
        [propertyId]: {
          tone: "error",
          message:
            error.response?.data?.message || "No se pudo actualizar el estado."
        }
      }));
    } finally {
      setSavingPropertyId("");
    }
  };

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm("Deseas eliminar esta propiedad?");
    if (!confirmed) return;
    await deleteProperty(propertyId);
    await loadProperties();
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
            Las propiedades en estado <strong>Publicado</strong> ya aparecen en el buscador.
          </p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>Nueva propiedad</Button>
        </Link>
      </div>

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
                    {item.propertyType} {item.featured ? "- Destacada" : "- Organica"}
                  </div>
                  {item.trustProfile?.score ? (
                    <div className="mt-2 text-xs text-ink/55">
                      Trust score {item.trustProfile.score}/100
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
                      variant="accent"
                      onClick={() => handleSaveStatus(item._id)}
                      disabled={savingPropertyId === item._id}
                    >
                      {savingPropertyId === item._id ? "Guardando..." : "Guardar estado"}
                    </Button>
                    <Link href={`/dashboard/properties/${item._id}/edit`}>
                      <Button variant="secondary">Editar</Button>
                    </Link>
                    <Button variant="ghost" onClick={() => handleDelete(item._id)}>
                      Eliminar
                    </Button>
                  </div>
                  {rowFeedback[item._id] ? (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        rowFeedback[item._id].tone === "success"
                          ? "text-pine"
                          : "text-red-600"
                      }`}
                    >
                      {rowFeedback[item._id].message}
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
