"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Radar,
  Shield,
  SlidersHorizontal
} from "lucide-react";
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
  const [alertCenter, setAlertCenter] = useState({
    newSearchMatches: 0,
    dueLeadActionsCount: 0,
    highlightedSearches: [],
    dueLeadActions: []
  });
  const [isAlertPanelHovered, setIsAlertPanelHovered] = useState(false);
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
      setAlertCenter({
        newSearchMatches: 0,
        dueLeadActionsCount: 0,
        highlightedSearches: [],
        dueLeadActions: []
      });
      setIsAlertPanelHovered(false);
      return undefined;
    }

    const loadAlertState = async () => {
      try {
        const data = await getDashboardSummary();
        const nextAlertCenter = {
          newSearchMatches: Number(data?.summary?.alertCenter?.newSearchMatches || 0),
          dueLeadActionsCount: Number(data?.summary?.alertCenter?.dueLeadActionsCount || 0),
          highlightedSearches: data?.summary?.alertCenter?.highlightedSearches || [],
          dueLeadActions: data?.summary?.alertCenter?.dueLeadActions || []
        };

        if (!cancelled) {
          setAlertCenter(nextAlertCenter);
        }
      } catch (_error) {
        if (!cancelled) {
          setAlertCenter({
            newSearchMatches: 0,
            dueLeadActionsCount: 0,
            highlightedSearches: [],
            dueLeadActions: []
          });
        }
      }
    };

    void loadAlertState();

    return () => {
      cancelled = true;
    };
  }, [activePathname, user]);

  const hasUnreadAlerts =
    Number(alertCenter.newSearchMatches || 0) > 0 ||
    Number(alertCenter.dueLeadActionsCount || 0) > 0;

  const primaryAlert = useMemo(() => {
    const firstSearch = alertCenter.highlightedSearches?.[0];
    const firstLead = alertCenter.dueLeadActions?.[0];

    if (firstSearch?.newMatches) {
      return {
        title:
          language === "en"
            ? "New saved-search match"
            : "Nueva coincidencia en busqueda guardada",
        detail:
          language === "en"
            ? `${firstSearch.name} has ${firstSearch.newMatches} new matching listings.`
            : `${firstSearch.name} tiene ${firstSearch.newMatches} coincidencias nuevas.`,
        href: "/dashboard/saved-searches"
      };
    }

    if (firstLead?.name || firstLead?.propertyTitle) {
      return {
        title:
          language === "en"
            ? "Lead pending follow-up"
            : "Lead pendiente de seguimiento",
        detail:
          language === "en"
            ? `${firstLead.name || "A lead"} needs follow-up on ${firstLead.propertyTitle || "a property"}.`
            : `${firstLead.name || "Un lead"} requiere seguimiento en ${firstLead.propertyTitle || "una propiedad"}.`,
        href: "/dashboard/leads"
      };
    }

    if (alertCenter.newSearchMatches) {
      return {
        title:
          language === "en"
            ? "New saved-search activity"
            : "Nueva actividad en busquedas guardadas",
        detail:
          language === "en"
            ? `You have ${alertCenter.newSearchMatches} new search matches waiting.`
            : `Tienes ${alertCenter.newSearchMatches} coincidencias nuevas esperando.`,
        href: "/dashboard/saved-searches"
      };
    }

    if (alertCenter.dueLeadActionsCount) {
      return {
        title:
          language === "en"
            ? "Lead action needed"
            : "Accion pendiente en leads",
        detail:
          language === "en"
            ? `You have ${alertCenter.dueLeadActionsCount} leads that should move today.`
            : `Tienes ${alertCenter.dueLeadActionsCount} leads que conviene mover hoy.`,
        href: "/dashboard/leads"
      };
    }

    return {
      title: language === "en" ? "No active alerts" : "Sin alertas activas",
      detail:
        language === "en"
          ? "No active alerts right now."
          : "No hay alertas activas en este momento.",
      href: "/dashboard/saved-searches"
    };
  }, [alertCenter, language]);

  const isAlertPanelOpen = isAlertPanelHovered;

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
        <div className="relative overflow-visible rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,249,244,0.82)_42%,rgba(237,244,248,0.82)_100%)] shadow-[0_22px_54px_rgba(17,34,54,0.12)] backdrop-blur-xl">
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
                    <div
                      className="relative"
                      onMouseEnter={() => setIsAlertPanelHovered(true)}
                      onMouseLeave={() => setIsAlertPanelHovered(false)}
                    >
                      <button
                        type="button"
                        aria-label={language === "en" ? "Open alert bell" : "Abrir campanita"}
                        title={language === "en" ? "Open alert bell" : "Abrir campanita"}
                        aria-expanded={isAlertPanelOpen}
                        onClick={() => router.push("/dashboard/saved-searches")}
                        className={cn(
                          "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 text-ink shadow-[0_12px_26px_rgba(17,34,54,0.08)] transition duration-200 hover:-translate-y-0.5",
                          isSavedSearchRoute || isAlertPanelOpen
                            ? "bg-[linear-gradient(135deg,#112236,#25577f)] text-white"
                            : "bg-white/88 hover:bg-white"
                        )}
                      >
                        <Bell className="h-4 w-4" />
                        {hasUnreadAlerts ? (
                          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sand" />
                        ) : null}
                      </button>

                      {isAlertPanelOpen ? (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,240,231,0.88),rgba(237,244,248,0.9))] p-4 shadow-[0_24px_54px_rgba(17,34,54,0.18)] backdrop-blur-xl">
                          <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-lagoon/12 p-2.5 text-lagoon">
                              <BellRing className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold leading-6 text-ink">
                                {primaryAlert.title}
                              </div>
                              <div className="mt-1 text-sm leading-6 text-ink/62">
                                {primaryAlert.detail}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[18px] border border-white/75 bg-white/88 px-3 py-3">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-lagoon">
                                <Radar className="h-3.5 w-3.5" />
                                {language === "en" ? "Searches" : "Busquedas"}
                              </div>
                              <div className="mt-2 text-2xl font-semibold text-ink">
                                {alertCenter.newSearchMatches || 0}
                              </div>
                            </div>
                            <div className="rounded-[18px] border border-white/75 bg-white/88 px-3 py-3">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-pine">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {language === "en" ? "Leads" : "Leads"}
                              </div>
                              <div className="mt-2 text-2xl font-semibold text-ink">
                                {alertCenter.dueLeadActionsCount || 0}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              href="/dashboard/saved-searches"
                              className="inline-flex items-center rounded-full bg-lagoon px-3 py-2 text-xs font-semibold text-white"
                            >
                              {language === "en" ? "Open bell" : "Abrir campanita"}
                            </Link>
                            <Link
                              href="/dashboard/leads"
                              className="inline-flex items-center rounded-full border border-white/80 bg-white/88 px-3 py-2 text-xs font-semibold text-ink"
                            >
                              {language === "en" ? "Open leads" : "Abrir leads"}
                            </Link>
                          </div>
                        </div>
                      ) : null}
                    </div>

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
                      variant="danger"
                      onClick={handleLogout}
                      className="rounded-full px-3 py-2.5 sm:px-4"
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
