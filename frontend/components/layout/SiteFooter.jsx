import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-3 text-sm text-ink/65">
            Plataforma inmobiliaria para explorar, publicar y conectar propiedades en Costa Rica.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            Explorar
          </h4>
          <div className="mt-4 space-y-2 text-sm text-ink/70">
            <Link href="/search">Buscar propiedades</Link>
            <br />
            <Link href="/favorites">Favoritos</Link>
            <br />
            <Link href="/dashboard">Publicar propiedad</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            Cobertura
          </h4>
          <p className="mt-4 text-sm text-ink/70">
            San Jose, Escazu, Santa Ana, Heredia, Alajuela, Cartago, Tamarindo, Jaco, Liberia y Nosara.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
            Contacto
          </h4>
          <p className="mt-4 text-sm text-ink/70">
            Si necesitas ayuda o soporte con la plataforma, puedes escribir a:
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
