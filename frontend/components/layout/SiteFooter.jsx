"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-3 md:gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(0,0.9fr)]">
        <div className="max-w-xl">
          <BrandLogo />
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
            <Link href="/dashboard" className="transition hover:text-pine">
              {t("footer.publishProperty")}
            </Link>
          </div>
        </div>
        <div className="md:justify-self-start">
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
