import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function AuthLayout({ children }) {
  return (
    <div className="app-shell section-pad">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface bg-hero-grid p-8 sm:p-12">
          <BrandLogo />
          <div className="mt-8">
            <span className="eyebrow">Costa Rica</span>
            <h2 className="mt-5 max-w-xl font-serif text-5xl font-semibold leading-tight">
              Publica, explora y conecta propiedades con una experiencia clara y moderna.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-ink/70">
              AlquiVentasCR concentra compra, renta y lotes con enfoque geoespacial:
              mapa, GPS, favoritos, leads y panel de publicacion.
            </p>
          </div>
        </section>
        <div>{children}</div>
      </div>
    </div>
  );
}
