import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Politica de cookies | BienesRaicesCR",
  description: "Informacion sobre cookies esenciales y de analitica en BienesRaicesCR."
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Politica de cookies"
      intro="Esta politica explica como BienesRaicesCR utiliza cookies y tecnologias similares para operar la plataforma, recordar preferencias y medir el uso del producto."
      lastUpdated="22 de marzo de 2026"
    >
      <LegalSection title="1. Que son las cookies">
        <p>
          Son pequeños archivos o identificadores que permiten recordar sesiones, preferencias y eventos de uso cuando visitas el sitio desde tu navegador o dispositivo.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies esenciales">
        <p>
          Se utilizan para funciones basicas como autenticacion, seguridad, mantenimiento de sesion, preferencias tecnicas y estabilidad del producto. Estas cookies son necesarias para operar la plataforma correctamente.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies de analitica">
        <p>
          Si el usuario lo autoriza, podemos usar herramientas como Google Analytics 4, PostHog u otra analitica equivalente para medir:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>visitas y paginas vistas</li>
          <li>favoritos guardados</li>
          <li>leads enviados</li>
          <li>publicaciones creadas</li>
          <li>conversiones y eventos relevantes de producto</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Gestion del consentimiento">
        <p>
          La primera vez que visitas el sitio puedes elegir entre aceptar analitica o mantener solo cookies esenciales. Tambien puedes reabrir las preferencias desde el pie de pagina.
        </p>
      </LegalSection>

      <LegalSection title="5. Como desactivarlas">
        <p>
          Ademas del selector interno de la plataforma, puedes restringir cookies desde la configuracion de tu navegador. Ten en cuenta que algunas funciones esenciales podrian verse afectadas.
        </p>
      </LegalSection>

      <LegalSection title="6. Cambios">
        <p>
          Esta politica puede actualizarse cuando cambien las herramientas de medicion, los requisitos legales o el funcionamiento del sitio.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
