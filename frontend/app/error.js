"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { reportFrontendError } from "@/lib/monitoring";

export default function Error({ error, reset }) {
  useEffect(() => {
    reportFrontendError(error, {
      digest: error?.digest,
      source: "next-route-error"
    });
  }, [error]);

  return (
    <div className="app-shell section-pad">
      <div className="surface mx-auto max-w-2xl space-y-4 p-8 text-center">
        <span className="eyebrow">Monitoreo activo</span>
        <h1 className="font-serif text-4xl font-semibold text-ink">
          Algo salio mal en esta seccion
        </h1>
        <p className="text-sm leading-7 text-ink/65">
          El incidente se registro para revision. Puedes intentar cargar nuevamente la vista.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Reintentar</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
