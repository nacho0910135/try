"use client";

import { useEffect } from "react";
import { reportFrontendError } from "@/lib/monitoring";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    reportFrontendError(error, {
      digest: error?.digest,
      source: "next-global-error"
    });
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-shell text-ink">
        <div className="app-shell section-pad">
          <div className="surface mx-auto max-w-2xl space-y-4 p-8 text-center">
            <span className="eyebrow">Incidente global</span>
            <h1 className="font-serif text-4xl font-semibold">
              Tuvimos un problema inesperado
            </h1>
            <p className="text-sm leading-7 text-ink/65">
              El error fue reportado automaticamente. Intenta recargar la aplicacion.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white shadow-soft"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
