"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteProperty, getMyProperties, updatePropertyStatus } from "@/lib/api";
import { formatCurrency, formatLocation, formatPropertyStatus } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardPropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState("");

  const loadProperties = async () => {
    try {
      const data = await getMyProperties();
      setItems(data.items || []);
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

  const handleStatusChange = async (propertyId, status) => {
    await updatePropertyStatus(propertyId, status);
    await loadProperties();
  };

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm("Deseas eliminar esta propiedad?");
    if (!confirmed) return;
    await deleteProperty(propertyId);
    await loadProperties();
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
              <th className="pb-4">Estado</th>
              <th className="pb-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b border-ink/5">
                <td className="py-4 pr-4">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-ink/45">{item.propertyType}</div>
                </td>
                <td className="py-4 pr-4 text-ink/65">{formatLocation(item)}</td>
                <td className="py-4 pr-4">{formatCurrency(item.price, item.currency)}</td>
                <td className="py-4 pr-4">
                  <div className="font-semibold">{item.views || item.engagement?.views || 0}</div>
                  <div className="text-xs text-ink/45">vistas publicas</div>
                </td>
                <td className="py-4 pr-4">
                  <select
                    value={item.status}
                    onChange={(event) => handleStatusChange(item._id, event.target.value)}
                    className="rounded-xl border border-ink/10 px-3 py-2"
                  >
                    {["draft", "published", "paused", "sold", "rented"].map((status) => (
                      <option key={status} value={status}>
                        {formatPropertyStatus(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/properties/${item._id}/edit`}>
                      <Button variant="secondary">Editar</Button>
                    </Link>
                    <Button variant="ghost" onClick={() => handleDelete(item._id)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
