"use client";

import Link from "next/link";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import { useAuthStore } from "@/store/auth-store";
import { useLanguage } from "./LanguageProvider";
import { BrandLogo } from "./BrandLogo";
import { CookiePreferencesButton } from "./CookiePreferencesButton";

export function SiteFooter() {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const canAccessDashboard = hasCommercialDashboardAccess(user);

  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.85fr)_minmax(0,0.9fr)]">
        <div className="max-w-xl">
          <BrandLogo compact showTagline={false} className="origin-left scale-[0.92]" />
          <p className="mt-3 text-sm text-ink/65">
            {t("footer.description")}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            {t("footer.explore")}
          </h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink/70">
            <Link href="/search" className="transition hover:text-pine">
              {t("footer.searchProperties")}
            </Link>
            <Link href="/analysis" className="transition hover:text-pine">
              {t("footer.analysis")}
            </Link>
            <Link href="/battle" className="transition hover:text-pine">
              {t("footer.battle")}
            </Link>
            <Link href="/favorites" className="transition hover:text-pine">
              {t("footer.favorites")}
            </Link>
            {!user || canAccessDashboard ? (
              <Link
                href={canAccessDashboard ? "/dashboard/properties/new" : "/login"}
                className="transition hover:text-pine"
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
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink/70">
            <Link href="/legal/privacy" className="transition hover:text-pine">
              Politica de privacidad
            </Link>
            <Link href="/legal/terms" className="transition hover:text-pine">
              Terminos y condiciones
            </Link>
            <Link href="/legal/cookies" className="transition hover:text-pine">
              Politica de cookies
            </Link>
            <CookiePreferencesButton className="text-sm text-ink/70" />
          </div>
        </div>
        <div className="md:justify-self-start">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            {t("footer.contact")}
          </h4>
          <p className="mt-4 text-sm text-ink/70">
            {t("footer.contactHelp")}
          </p>
          <Link
            href="/contact"
            className="mt-3 block text-sm font-semibold text-ink transition hover:text-pine"
          >
            Pagina de contacto y soporte
          </Link>
          <a
            href="mailto:jose17mp@hotmail.com"
            className="mt-3 inline-flex text-sm font-semibold text-pine transition hover:text-lagoon"
          >
            jose17mp@hotmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
