import Link from "next/link";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const items = [
  { href: "/admin", label: "Metricas" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/properties", label: "Propiedades" }
];

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="app-shell section-pad space-y-6">
        <nav className="surface flex flex-wrap gap-2 p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-ink/75"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </ProtectedRoute>
  );
}

