"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { logoutUser } from "@/lib/api";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { BrandLogo } from "./BrandLogo";
import { DonateButton } from "./DonateButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import { Button } from "../ui/Button";

export function SiteHeader() {
  const pathname = usePathname();
  const activePathname = pathname || "";
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t, language } = useLanguage();
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : "/login";
  const publishLabel = language === "en" ? "Publish" : "Publicar";
  const alertsLabel = language === "en" ? "Alerts" : "Alertas";
  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/search", label: t("nav.explore") },
    { href: "/analysis", label: t("nav.analysis") },
    { href: "/battle", label: t("nav.battle") },
    { href: "/favorites", label: t("nav.favorites") },
    ...(user ? [{ href: "/dashboard/saved-searches", label: alertsLabel }] : [])
  ];

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
      <div className="app-shell py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="hidden min-w-0 items-center gap-3 sm:flex">
            <BrandLogo
              compact
              showTagline={false}
              mobileTextOnly
              mobileSingleLine
              className="max-w-[52vw] sm:max-w-none"
            />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/80",
                  activePathname === item.href ? "bg-white text-ink shadow-soft" : "text-ink/70"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher className="mr-0.5 sm:mr-1" />

            <Link href={publishHref}>
              <Button variant="primary" className="px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                {publishLabel}
              </Button>
            </Link>

            <DonateButton compact className="px-2.5 py-2 sm:px-3.5 sm:py-2.5" />

            {user ? (
              <>
                {canAccessDashboard ? (
                  <Link href="/dashboard">
                    <Button variant="secondary" className="hidden sm:inline-flex">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("nav.dashboard")}
                    </Button>
                  </Link>
                ) : null}
                {user.role === "admin" ? (
                  <Link href="/admin">
                    <Button variant="ghost" className="hidden sm:inline-flex">
                      <Shield className="mr-2 h-4 w-4" />
                      {t("nav.admin")}
                    </Button>
                  </Link>
                ) : null}
                <Button variant="ghost" onClick={handleLogout} className="px-3 py-2 sm:px-4 sm:py-3">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("nav.logout")}</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="secondary" className="px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            <Link href="/favorites" className="rounded-full bg-white p-2.5 shadow-soft md:hidden">
              <Heart className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition",
                activePathname === item.href ? "bg-white text-ink shadow-soft" : "bg-white/70 text-ink/70"
              )}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            canAccessDashboard ? (
              <Link
                href="/dashboard"
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition",
                  activePathname.startsWith("/dashboard")
                    ? "bg-ink text-white shadow-soft"
                    : "bg-pine/10 text-pine"
                )}
              >
                {t("nav.dashboard")}
              </Link>
            ) : null
          ) : null}

          <Link
            href={publishHref}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition",
              activePathname.startsWith("/dashboard/properties/new")
                ? "bg-ink text-white shadow-soft"
                : "bg-pine/10 text-pine"
            )}
          >
            {publishLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
