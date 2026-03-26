"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutDashboard, LogOut, Shield, SlidersHorizontal } from "lucide-react";
import { getDashboardSummary, logoutUser } from "@/lib/api";
import { hasManagementAccess } from "@/lib/management-access";
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
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const canAccessManagement = hasManagementAccess(user);
  const isSavedSearchRoute = activePathname.startsWith("/dashboard/saved-searches");
  const isDashboardRoute = activePathname.startsWith("/dashboard");
  const isManagementRoute = activePathname.startsWith("/gestion");
  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/search", label: t("nav.explore") },
    { href: "/analysis", label: t("nav.analysis") },
    { href: "/battle", label: t("nav.battle") },
    { href: "/favorites", label: t("nav.favorites") }
  ];

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setHasUnreadAlerts(false);
      return undefined;
    }

    const loadAlertState = async () => {
      try {
        const data = await getDashboardSummary();
        const unreadCount = Number(data?.summary?.alertCenter?.newSearchMatches || 0);

        if (!cancelled) {
          setHasUnreadAlerts(unreadCount > 0);
        }
      } catch (_error) {
        if (!cancelled) {
          setHasUnreadAlerts(false);
        }
      }
    };

    void loadAlertState();

    return () => {
      cancelled = true;
    };
  }, [activePathname, user]);

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
    <header className="sticky top-0 z-40 pt-3 sm:pt-4">
      <div className="app-shell">
        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,249,244,0.82)_42%,rgba(237,244,248,0.82)_100%)] shadow-[0_22px_54px_rgba(17,34,54,0.12)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-12 top-0 h-28 w-28 rounded-full bg-lagoon/12 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-terracotta/12 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(17,34,54,0.16),transparent)]" />

          <div className="relative px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                className="min-w-0 rounded-[24px] border border-white/80 bg-white/78 px-2.5 py-2 shadow-[0_14px_32px_rgba(17,34,54,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/88"
              >
                <BrandLogo
                  compact
                  showTagline={false}
                  mobileTextOnly
                  mobileSingleLine
                  className="max-w-[46vw] sm:max-w-none"
                />
              </Link>

              <nav className="hidden items-center rounded-full border border-white/75 bg-white/58 p-1 shadow-[0_14px_34px_rgba(17,34,54,0.08)] backdrop-blur lg:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200",
                      activePathname === item.href
                        ? "bg-[linear-gradient(135deg,#112236,#25577f)] text-white shadow-[0_12px_24px_rgba(17,34,54,0.16)]"
                        : "text-ink/62 hover:bg-white/90 hover:text-ink"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <LanguageSwitcher className="hidden border-white/75 bg-white/66 shadow-[0_12px_28px_rgba(17,34,54,0.08)] md:inline-flex" />

                {user ? (
                  <div className="flex items-center gap-1 rounded-full border border-white/75 bg-white/56 p-1 shadow-[0_14px_34px_rgba(17,34,54,0.08)] backdrop-blur">
                    <Link
                      href="/dashboard/saved-searches"
                      aria-label={language === "en" ? "Open alert bell" : "Abrir campanita"}
                      title={language === "en" ? "Open alert bell" : "Abrir campanita"}
                      className={cn(
                        "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 text-ink shadow-[0_12px_26px_rgba(17,34,54,0.08)] transition duration-200 hover:-translate-y-0.5",
                        isSavedSearchRoute
                          ? "bg-[linear-gradient(135deg,#112236,#25577f)] text-white"
                          : "bg-white/88 hover:bg-white"
                      )}
                    >
                      <Bell className="h-4 w-4" />
                      {hasUnreadAlerts ? (
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sand" />
                      ) : null}
                    </Link>

                    {canAccessDashboard ? (
                      <Link href="/dashboard" className="hidden sm:block">
                        <Button
                          variant="secondary"
                          className={cn(
                            "rounded-full border border-white/80 px-4 py-2.5 shadow-none",
                            isDashboardRoute
                              ? "bg-ink text-white hover:bg-[#18324b]"
                              : "bg-white/88 hover:bg-white"
                          )}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                    ) : null}

                    {canAccessManagement ? (
                      <Link href="/gestion" className="hidden sm:block">
                        <Button
                          variant="secondary"
                          className={cn(
                            "rounded-full border border-white/80 px-4 py-2.5 shadow-none",
                            isManagementRoute
                              ? "bg-[linear-gradient(135deg,#24537a,#3f8cbc)] text-white hover:bg-[linear-gradient(135deg,#1d486a,#377da9)]"
                              : "bg-white/88 hover:bg-white"
                          )}
                        >
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          Gestion
                        </Button>
                      </Link>
                    ) : null}

                    {user.role === "admin" ? (
                      <Link href="/admin" className="hidden lg:block">
                        <Button
                          variant="ghost"
                          className="rounded-full border border-white/80 bg-white/72 px-4 py-2.5 hover:bg-white"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {t("nav.admin")}
                        </Button>
                      </Link>
                    ) : null}

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="rounded-full border border-white/80 bg-white/72 px-3 py-2.5 hover:bg-white sm:px-4"
                    >
                      <LogOut className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t("nav.logout")}</span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      className="rounded-full border border-white/80 bg-white/82 px-3 py-2.5 text-xs shadow-[0_12px_28px_rgba(17,34,54,0.08)] hover:bg-white sm:px-4 sm:text-sm"
                    >
                      {t("nav.login")}
                    </Button>
                  </Link>
                )}

                <DonateButton
                  compact
                  className="hidden rounded-full border border-white/80 bg-white/82 px-3 py-2.5 text-ink shadow-[0_12px_28px_rgba(17,34,54,0.08)] hover:bg-white sm:inline-flex"
                />
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto rounded-full border border-white/75 bg-white/56 p-1 shadow-[0_14px_34px_rgba(17,34,54,0.08)] backdrop-blur lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition duration-200",
                    activePathname === item.href
                      ? "bg-[linear-gradient(135deg,#112236,#25577f)] text-white shadow-[0_10px_22px_rgba(17,34,54,0.16)]"
                      : "text-ink/62 hover:bg-white/85 hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {user && canAccessDashboard ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition duration-200",
                    isDashboardRoute
                      ? "bg-ink text-white shadow-[0_10px_22px_rgba(17,34,54,0.16)]"
                      : "bg-pine/10 text-pine hover:bg-pine/15"
                  )}
                >
                  {t("nav.dashboard")}
                </Link>
              ) : null}

              {user && canAccessManagement ? (
                <Link
                  href="/gestion"
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition duration-200",
                    isManagementRoute
                      ? "bg-[linear-gradient(135deg,#24537a,#3f8cbc)] text-white shadow-[0_10px_22px_rgba(17,34,54,0.16)]"
                      : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                  )}
                >
                  Gestion
                </Link>
              ) : null}

              <DonateButton
                compact
                className="shrink-0 rounded-full border border-white/80 bg-white/82 px-3 py-2 text-ink shadow-none hover:bg-white sm:hidden"
              />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
