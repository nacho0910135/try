"use client";

import { useEffect, useState } from "react";
import { getManageProperty } from "@/lib/api";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { LoadingState } from "@/components/ui/LoadingState";

export default function EditPropertyPage({ params }) {
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const loadProperty = async () => {
      const data = await getManageProperty(params.id);
      setProperty(data.property);
    };

    loadProperty();
  }, [params.id]);

  if (!property) {
    return <LoadingState label="Cargando propiedad..." />;
  }

  return <PropertyForm property={property} propertyId={params.id} />;
}

