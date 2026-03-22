export function LegalPageLayout({ eyebrow, title, intro, lastUpdated, children }) {
  return (
    <div className="app-shell section-pad">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="surface bg-hero-grid p-8">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-ink">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">{intro}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink/45">
            Ultima actualizacion: {lastUpdated}
          </p>
        </header>

        <article className="surface space-y-8 p-8 text-sm leading-7 text-ink/72">
          {children}
        </article>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
