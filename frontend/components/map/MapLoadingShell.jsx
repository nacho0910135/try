"use client";

import { cn } from "@/lib/utils";

export function MapLoadingShell({
  label = "Cargando mapa...",
  minHeight = 320,
  className
}) {
  return (
    <div
      className={cn(
        "surface-elevated flex items-center justify-center rounded-[30px] border border-white/60 bg-hero-grid px-6 py-8 text-center text-sm font-medium text-ink/60",
        className
      )}
      style={{ minHeight }}
    >
      {label}
    </div>
  );
}
