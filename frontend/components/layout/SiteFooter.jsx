"use client";

import Link from "next/link";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import { useAuthStore } from "@/store/auth-store";
import { useLanguage } from "./LanguageProvider";
import { BrandLogo } from "./BrandLogo";
import { CookiePreferencesButton } from "./CookiePreferencesButton";

export function SiteFooter() {
  const { user } = useAuthStore();
  const { language, t } = useLanguage();
  const canAccessDashboard = hasCommercialDashboardAccess(user);

  return (
    <footer className="pb-8 pt-10 sm:pb-10 sm:pt-14">
      <div className="app-shell">
        <div className="surface-elevated relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-terracotta/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-lagoon/10 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.85fr)_minmax(0,0.9fr)]">
            <div className="max-w-xl">
              <div className="inline-flex rounded-[24px] border border-white/80 bg-white/72 px-4 py-3 shadow-soft">
                <BrandLogo compact showTagline={false} className="origin-left scale-[0.92]" />
              </div>
              <p className="mt-4 text-sm leading-7 text-ink/65">
                {t("footer.description")}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
                {t("footer.explore")}
              </h4>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-ink/70">
                <Link href="/search" className="transition hover:translate-x-0.5 hover:text-pine">
                  {t("footer.searchProperties")}
                </Link>
                <Link
                  href="/destacadas"
                  className="transition hover:translate-x-0.5 hover:text-pine"
                >
                  {language === "en" ? "Boost showcase" : "Vitrina boost"}
                </Link>
                <Link href="/analysis" className="transition hover:translate-x-0.5 hover:text-pine">
                  {t("footer.analysis")}
                </Link>
                <Link href="/battle" className="transition hover:translate-x-0.5 hover:text-pine">
                  {t("footer.battle")}
                </Link>
                <Link href="/favorites" className="transition hover:translate-x-0.5 hover:text-pine">
                  {t("footer.favorites")}
                </Link>
                {!user || canAccessDashboard ? (
                  <Link
                    href={canAccessDashboard ? "/dashboard/properties/new" : "/login"}
                    className="transition hover:translate-x-0.5 hover:text-pine"
                  >
                    {t("footer.publishProperty")}
                  </Link>
                ) : null}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
                Legal
              </h4>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-ink/70">
                <Link href="/legal/privacy" className="transition hover:translate-x-0.5 hover:text-pine">
                  Politica de privacidad
                </Link>
                <Link href="/legal/terms" className="transition hover:translate-x-0.5 hover:text-pine">
                  Terminos y condiciones
                </Link>
                <Link href="/legal/cookies" className="transition hover:translate-x-0.5 hover:text-pine">
                  Politica de cookies
                </Link>
                <CookiePreferencesButton className="text-sm text-ink/70" />
              </div>
            </div>
            <div className="md:justify-self-start">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
                {t("footer.contact")}
              </h4>
              <p className="mt-4 text-sm leading-7 text-ink/70">
                {t("footer.contactHelp")}
              </p>
              <Link
                href="/contact"
                className="mt-3 block text-sm font-semibold text-ink transition hover:text-pine"
              >
                Pagina de contacto y soporte
              </Link>
              <a
                href="mailto:bienesraicescrnet@gmail.com"
                className="mt-3 inline-flex rounded-full border border-white/80 bg-white/76 px-3.5 py-2 text-sm font-semibold text-pine shadow-soft transition hover:bg-white hover:text-lagoon"
              >
                bienesraicescrnet@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
