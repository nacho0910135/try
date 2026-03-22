"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-3 text-sm text-ink/65">
            {t("footer.description")}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            {t("footer.explore")}
          </h4>
          <div className="mt-4 space-y-2 text-sm text-ink/70">
            <Link href="/search">{t("footer.searchProperties")}</Link>
            <br />
            <Link href="/analysis">{t("footer.analysis")}</Link>
            <br />
            <Link href="/battle">{t("footer.battle")}</Link>
            <br />
            <Link href="/favorites">{t("footer.favorites")}</Link>
            <br />
            <Link href="/dashboard">{t("footer.publishProperty")}</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            {t("footer.coverage")}
          </h4>
          <p className="mt-4 text-sm text-ink/70">{t("footer.coverageText")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            {t("footer.contact")}
          </h4>
          <p className="mt-4 text-sm text-ink/70">
            {t("footer.contactHelp")}
          </p>
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
