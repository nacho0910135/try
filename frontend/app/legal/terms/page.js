import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Terminos y condiciones | BienesRaicesCR",
  description: "Condiciones de uso de BienesRaicesCR para visitantes, usuarios y anunciantes."
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terminos y condiciones"
      intro="Estos terminos regulan el acceso y uso de BienesRaicesCR por parte de visitantes, usuarios registrados, propietarios, agentes y administradores."
      lastUpdated="22 de marzo de 2026"
    >
      <LegalSection title="1. Objeto del servicio">
        <p>
          BienesRaicesCR es una plataforma digital para publicar, descubrir, comparar y analizar propiedades en Costa Rica. No actua como notario, corredor exclusivo, entidad financiera ni intermediario obligatorio en cada transaccion.
        </p>
      </LegalSection>

      <LegalSection title="2. Registro y cuentas">
        <p>
          El usuario es responsable de mantener segura su cuenta y de suministrar informacion veraz y actualizada. Las credenciales son personales y no deben compartirse.
        </p>
      </LegalSection>

      <LegalSection title="3. Publicacion de propiedades">
        <p>
          Quien publica una propiedad garantiza que tiene autorizacion suficiente para ofrecerla, administrar su informacion o representar al propietario.
        </p>
        <p>
          BienesRaicesCR puede moderar, pausar, rechazar o desactivar publicaciones que incumplan estos terminos, contengan informacion engañosa, contenido repetido, spam o riesgo para terceros.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso permitido">
        <ul className="list-disc space-y-2 pl-6">
          <li>Buscar propiedades y contactar anunciantes de forma legitima.</li>
          <li>Publicar inventario autentico y actualizado.</li>
          <li>Utilizar comparativas, alertas y analitica de forma razonable.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Uso prohibido">
        <ul className="list-disc space-y-2 pl-6">
          <li>Publicar propiedades falsas, duplicadas o no autorizadas.</li>
          <li>Suplantar identidades o usar datos de terceros sin permiso.</li>
          <li>Extraer datos masivamente, automatizar scraping o abusar de la plataforma.</li>
          <li>Enviar spam, mensajes engañosos, malware o contenido ofensivo.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Leads, ofertas y contacto">
        <p>
          La plataforma facilita el contacto entre partes, pero no garantiza cierres, disponibilidad permanente, exactitud absoluta de cada anuncio ni capacidad economica de quien consulta o ofrece.
        </p>
      </LegalSection>

      <LegalSection title="7. Analitica y herramientas inteligentes">
        <p>
          Las comparativas, proyecciones, analisis de precio y dashboards son herramientas de apoyo para tomar decisiones. No constituyen asesoria legal, financiera, valuacion oficial ni recomendacion profesional obligatoria.
        </p>
      </LegalSection>

      <LegalSection title="8. Propiedad intelectual">
        <p>
          El software, diseño, estructura, marca, textos, dashboards y elementos visuales de BienesRaicesCR estan protegidos. El usuario conserva la titularidad del contenido que sube, pero concede una licencia operativa para mostrarlo dentro de la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitacion de responsabilidad">
        <p>
          BienesRaicesCR no responde por negociaciones privadas, incumplimientos contractuales entre partes, errores de terceros, disponibilidad de servicios externos ni decisiones tomadas exclusivamente con base en la informacion publicada.
        </p>
      </LegalSection>

      <LegalSection title="10. Suspensiones y terminacion">
        <p>
          Podemos suspender o cerrar cuentas cuando exista incumplimiento de terminos, riesgo de seguridad, uso abusivo o requerimiento legal.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Para soporte o consultas relacionadas con estos terminos escribe a{" "}
          <a className="font-semibold text-pine" href="mailto:jose17mp@hotmail.com">
            jose17mp@hotmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
