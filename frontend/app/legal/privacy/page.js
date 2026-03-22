import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Politica de privacidad | BienesRaicesCR",
  description: "Tratamiento de datos personales en BienesRaicesCR."
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Politica de privacidad"
      intro="Esta politica explica como BienesRaicesCR recopila, usa, protege y conserva datos personales de usuarios, anunciantes, propietarios y visitantes dentro de la plataforma."
      lastUpdated="22 de marzo de 2026"
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          BienesRaicesCR es responsable del tratamiento de los datos recopilados a traves del sitio web, formularios de contacto, registro, publicacion de propiedades y herramientas de analitica de producto.
        </p>
        <p>
          Para consultas de privacidad o ejercicio de derechos puedes escribir a{" "}
          <a className="font-semibold text-pine" href="mailto:jose17mp@hotmail.com">
            jose17mp@hotmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recopilamos">
        <p>Podemos recopilar las siguientes categorias de datos:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Datos de cuenta: nombre, correo, telefono, rol y credenciales cifradas.</li>
          <li>Datos de publicacion: informacion del inmueble, fotos, videos, coordenadas y detalles de contacto visibles.</li>
          <li>Datos de interaccion: favoritos, consultas, ofertas, busquedas guardadas y alertas.</li>
          <li>Datos tecnicos: direccion IP, navegador, paginas visitadas, eventos de producto y errores tecnicos.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalidades del tratamiento">
        <ul className="list-disc space-y-2 pl-6">
          <li>Operar la cuenta y autenticar usuarios.</li>
          <li>Publicar, administrar y moderar propiedades.</li>
          <li>Facilitar contacto entre interesados y anunciantes.</li>
          <li>Enviar alertas de nuevas coincidencias o bajadas de precio cuando el usuario lo solicite.</li>
          <li>Medir uso del producto para mejorar experiencia, conversion y calidad del inventario.</li>
          <li>Prevenir abuso, fraude, spam o uso indebido de la plataforma.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base legal y consentimiento">
        <p>
          Tratamos datos cuando es necesario para ejecutar el servicio solicitado por el usuario, cumplir obligaciones operativas o proteger la seguridad de la plataforma.
        </p>
        <p>
          Cuando utilizamos cookies o herramientas de analitica no esenciales, pedimos consentimiento previo mediante el banner de cookies.
        </p>
      </LegalSection>

      <LegalSection title="5. Comparticion de datos">
        <p>
          No vendemos datos personales. Podemos compartir informacion estrictamente necesaria con proveedores de infraestructura, correo, analitica, mapas, almacenamiento multimedia y servicios de soporte tecnico.
        </p>
        <p>
          La informacion del propietario o anunciante no se comparte con motores de analisis comparativo mas alla de los datos minimizados necesarios para estadisticas del producto.
        </p>
      </LegalSection>

      <LegalSection title="6. Conservacion">
        <p>
          Conservamos la informacion mientras exista una cuenta activa, una propiedad publicada o una necesidad operativa, legal o de seguridad. Los historicos de propiedades vendidas o alquiladas pueden mantenerse para analitica de mercado y trazabilidad interna.
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad">
        <p>
          Aplicamos controles razonables de seguridad, incluyendo autenticacion con JWT, validaciones de entrada, sanitizacion, rate limiting, monitoreo tecnico y protecciones de infraestructura. Ningun sistema conectado a internet puede garantizar seguridad absoluta.
        </p>
      </LegalSection>

      <LegalSection title="8. Derechos del usuario">
        <p>
          Puedes solicitar acceso, correccion o eliminacion de datos, asi como ejercer oposicion razonable al tratamiento cuando proceda. Para ello escribe a{" "}
          <a className="font-semibold text-pine" href="mailto:jose17mp@hotmail.com">
            jose17mp@hotmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios a esta politica">
        <p>
          BienesRaicesCR puede actualizar esta politica para reflejar cambios legales, tecnicos o del producto. La version vigente sera siempre la publicada en esta pagina.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
