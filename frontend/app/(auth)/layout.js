"use client";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function AuthLayout({ children }) {
  const { t } = useLanguage();

  return (
    <div className="app-shell section-pad">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface bg-hero-grid p-8 sm:p-12">
          <BrandLogo />
          <div className="mt-8">
            <span className="eyebrow">{t("authLayout.eyebrow")}</span>
            <h2 className="mt-5 max-w-xl font-serif text-5xl font-semibold leading-tight">
              {t("authLayout.title")}
            </h2>
            <p className="mt-5 max-w-2xl text-base text-ink/70">
              {t("authLayout.description")}
            </p>
          </div>
        </section>
        <div>{children}</div>
      </div>
    </div>
  );
}
