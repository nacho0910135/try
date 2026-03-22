"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminProperties, moderateAdminProperty } from "@/lib/api";
import { formatCurrency, formatPropertyStatus } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState(null);

  const loadProperties = async () => {
    const data = await getAdminProperties();
    setProperties(data.items || []);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleModeration = async (propertyId, payload) => {
    await moderateAdminProperty(propertyId, payload);
    await loadProperties();
  };

  if (!properties) {
    return <LoadingState label="Cargando propiedades..." />;
  }

  return (
    <section className="surface p-6">
      <span className="eyebrow">Moderacion</span>
      <h1 className="mt-4 font-serif text-4xl font-semibold">Gestion de propiedades</h1>
      <div className="mt-6 space-y-4">
        {properties.map((property) => (
          <div key={property._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{property.title}</div>
                <div className="text-sm text-ink/55">
                  {property.owner?.name} • {formatCurrency(property.price, property.currency)} •{" "}
                  {formatPropertyStatus(property.status)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={property.isApproved ? "secondary" : "accent"}
                  onClick={() =>
                    handleModeration(property._id, {
                      isApproved: !property.isApproved
                    })
                  }
                >
                  {property.isApproved ? "Desaprobar" : "Aprobar"}
                </Button>
                <Button
                  variant={property.featured ? "secondary" : "ghost"}
                  onClick={() =>
                    handleModeration(property._id, {
                      featured: !property.featured
                    })
                  }
                >
                  {property.featured ? "Quitar destacada" : "Destacar"}
                </Button>
                <select
                  value={property.status}
                  onChange={(event) =>
                    handleModeration(property._id, { status: event.target.value })
                  }
                  className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
                >
                  {["draft", "published", "paused", "sold", "rented"].map((status) => (
                    <option key={status} value={status}>
                      {formatPropertyStatus(status)}
                    </option>
                  ))}
                </select>
                <Link href={`/properties/${property.slug}`}>
                  <Button variant="ghost">Ver</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
