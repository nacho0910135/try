"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, Search, Shield } from "lucide-react";
import { logoutUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { BrandLogo } from "./BrandLogo";
import { Button } from "../ui/Button";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/search", label: "Explorar" },
  { href: "/favorites", label: "Favoritos" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_error) {
      // Logout remains client-side safe even if the API call fails.
    } finally {
      logout();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-sand/80 backdrop-blur">
      <div className="app-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo compact showTagline={false} />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/80",
                pathname === item.href ? "bg-white text-ink shadow-soft" : "text-ink/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="secondary" className="hidden sm:inline-flex">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              {user.role === "admin" ? (
                <Link href="/admin">
                  <Button variant="ghost" className="hidden sm:inline-flex">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              ) : null}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link href="/search">
                <Button variant="secondary" className="hidden sm:inline-flex">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary">Entrar</Button>
              </Link>
            </>
          )}
          <Link href="/favorites" className="rounded-full bg-white p-3 shadow-soft md:hidden">
            <Heart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
