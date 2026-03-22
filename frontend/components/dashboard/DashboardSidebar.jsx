"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/business", label: "Visibilidad y metricas" },
  { href: "/dashboard/properties", label: "Mis propiedades" },
  { href: "/dashboard/properties/new", label: "Nueva propiedad" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/offers", label: "Ofertas" },
  { href: "/dashboard/saved-searches", label: "Busquedas guardadas" }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface h-fit p-4">
      <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
        Panel
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm font-medium transition",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-ink text-white"
                : "text-ink/70 hover:bg-mist"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
