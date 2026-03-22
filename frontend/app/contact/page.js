import Link from "next/link";

export const metadata = {
  title: "Contacto y soporte | BienesRaicesCR",
  description: "Canales de contacto y soporte de BienesRaicesCR."
};

export default function ContactPage() {
  return (
    <div className="app-shell section-pad">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="surface bg-hero-grid p-8">
          <span className="eyebrow">Soporte</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-ink">
            Contacto y soporte
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">
            Si necesitas ayuda con publicaciones, cuentas, leads, alertas o cualquier tema operativo de la plataforma, puedes comunicarte directamente con BienesRaicesCR.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="surface space-y-4 p-6">
            <h2 className="text-2xl font-semibold text-ink">Canal principal</h2>
            <p className="text-sm leading-7 text-ink/70">
              Para soporte general, consultas comerciales, privacidad o incidencias del sitio:
            </p>
            <a
              href="mailto:jose17mp@hotmail.com"
              className="inline-flex text-lg font-semibold text-pine transition hover:text-lagoon"
            >
              jose17mp@hotmail.com
            </a>
          </div>

          <div className="surface space-y-4 p-6">
            <h2 className="text-2xl font-semibold text-ink">Que incluir en tu mensaje</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-ink/70">
              <li>Tu nombre y correo de acceso</li>
              <li>La propiedad o pagina involucrada, si aplica</li>
              <li>Una descripcion breve y clara del problema</li>
              <li>Captura de pantalla si hubo un error visual</li>
            </ul>
          </div>
        </section>

        <section className="surface space-y-4 p-6">
          <h2 className="text-2xl font-semibold text-ink">Enlaces utiles</h2>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/legal/privacy" className="rounded-full bg-mist px-4 py-2 text-ink transition hover:text-pine">
              Politica de privacidad
            </Link>
            <Link href="/legal/terms" className="rounded-full bg-mist px-4 py-2 text-ink transition hover:text-pine">
              Terminos y condiciones
            </Link>
            <Link href="/legal/cookies" className="rounded-full bg-mist px-4 py-2 text-ink transition hover:text-pine">
              Politica de cookies
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
