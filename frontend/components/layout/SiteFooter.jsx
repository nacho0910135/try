import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold">Casa CR</h3>
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
      </div>
    </footer>
  );
}

