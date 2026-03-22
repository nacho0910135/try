import { mailService } from "./mailService.js";

const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CRC" ? 0 : 0
  }).format(Number(value || 0));

const formatLocation = (property = {}) =>
  [property.address?.district, property.address?.canton, property.address?.province]
    .filter(Boolean)
    .join(", ");

const buildLeadEmail = ({ lead, property, recipientName }) => {
  const subject = `Nuevo lead para ${property.title} en BienesRaicesCR`;
  const text = [
    `Hola ${recipientName || "equipo"},`,
    "",
    `Recibiste un nuevo lead para: ${property.title}.`,
    `Zona: ${formatLocation(property)}`,
    `Precio publicado: ${formatCurrency(property.price, property.currency)}`,
    "",
    `Contacto: ${lead.name}`,
    `Correo: ${lead.email}`,
    `Telefono: ${lead.phone || "No indicado"}`,
    "",
    "Mensaje:",
    lead.message || "Sin mensaje",
    "",
    "Entra a tu dashboard de leads para darle seguimiento."
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2d3d;line-height:1.6">
      <h2 style="margin-bottom:8px">Nuevo lead en BienesRaicesCR</h2>
      <p>Hola ${recipientName || "equipo"}, recibiste un nuevo lead para <strong>${property.title}</strong>.</p>
      <p>
        <strong>Zona:</strong> ${formatLocation(property)}<br />
        <strong>Precio:</strong> ${formatCurrency(property.price, property.currency)}
      </p>
      <hr style="border:none;border-top:1px solid #e6ebf0;margin:16px 0" />
      <p><strong>Contacto:</strong> ${lead.name}</p>
      <p><strong>Correo:</strong> ${lead.email}<br /><strong>Telefono:</strong> ${
        lead.phone || "No indicado"
      }</p>
      <p><strong>Mensaje:</strong><br />${lead.message || "Sin mensaje"}</p>
      <p style="margin-top:16px">Entra a tu dashboard de leads para darle seguimiento rapido.</p>
    </div>
  `;

  return { subject, text, html };
};

const buildSavedSearchCard = (property, extraLine = "") => `
  <div style="border:1px solid #e6ebf0;border-radius:16px;padding:14px;background:#ffffff">
    <div style="font-weight:700">${property.title}</div>
    <div style="font-size:13px;color:#62748a;margin-top:4px">${formatLocation(property)}</div>
    <div style="margin-top:8px;font-weight:600;color:#2c6847">
      ${formatCurrency(property.currentPrice || property.price, property.currency)}
    </div>
    ${extraLine ? `<div style="margin-top:6px;font-size:13px;color:#b5522d">${extraLine}</div>` : ""}
  </div>
`;

const buildSavedSearchAlertEmail = ({ user, savedSearch, alertPreview, searchUrl }) => {
  const newMatches = alertPreview.recentNewMatches || [];
  const priceDrops = alertPreview.recentPriceDrops || [];
  const headlineCount =
    alertPreview.emailMatches + alertPreview.priceDropMatchesCount || alertPreview.totalMatches;

  const text = [
    `Hola ${user.name || "cliente"},`,
    "",
    `Tu busqueda guardada "${savedSearch.name}" tiene ${headlineCount} novedades para revisar.`,
    "",
    `Nuevas coincidencias: ${alertPreview.emailMatches || 0}`,
    `Propiedades con bajada de precio: ${alertPreview.priceDropMatchesCount || 0}`,
    "",
    ...(newMatches.length
      ? [
          "Nuevas coincidencias:",
          ...newMatches.map(
            (property, index) =>
              `${index + 1}. ${property.title} - ${formatLocation(property)} - ${formatCurrency(
                property.price,
                property.currency
              )}`
          ),
          ""
        ]
      : []),
    ...(priceDrops.length
      ? [
          "Bajadas de precio:",
          ...priceDrops.map(
            (property, index) =>
              `${index + 1}. ${property.title} - ${formatLocation(property)} - ${formatCurrency(
                property.currentPrice,
                property.currency
              )} (antes ${formatCurrency(property.previousPrice, property.currency)})`
          ),
          ""
        ]
      : []),
    `Explora la zona aqui: ${searchUrl}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2d3d;line-height:1.6">
      <h2 style="margin-bottom:8px">Novedades para tu busqueda guardada</h2>
      <p>Hola ${user.name || "cliente"}, tu busqueda <strong>${savedSearch.name}</strong> tiene <strong>${headlineCount}</strong> novedades.</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin:18px 0">
        <div style="min-width:180px;border-radius:18px;padding:14px 16px;background:#f1f7f3;border:1px solid #d7eadc">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#2c6847;font-weight:700">Nuevas coincidencias</div>
          <div style="margin-top:8px;font-size:28px;font-weight:700;color:#17202c">${alertPreview.emailMatches || 0}</div>
        </div>
        <div style="min-width:180px;border-radius:18px;padding:14px 16px;background:#fff3ee;border:1px solid #f2d8cd">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#b5522d;font-weight:700">Bajadas de precio</div>
          <div style="margin-top:8px;font-size:28px;font-weight:700;color:#17202c">${alertPreview.priceDropMatchesCount || 0}</div>
        </div>
      </div>
      ${
        newMatches.length
          ? `
            <div style="margin-top:20px">
              <h3 style="margin:0 0 12px;font-size:16px">Nuevas propiedades que coinciden</h3>
              <div style="display:grid;gap:12px">
                ${newMatches.map((property) => buildSavedSearchCard(property)).join("")}
              </div>
            </div>
          `
          : ""
      }
      ${
        priceDrops.length
          ? `
            <div style="margin-top:20px">
              <h3 style="margin:0 0 12px;font-size:16px">Propiedades que bajaron de precio</h3>
              <div style="display:grid;gap:12px">
                ${priceDrops
                  .map((property) =>
                    buildSavedSearchCard(
                      property,
                      `Antes ${formatCurrency(property.previousPrice, property.currency)}`
                    )
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }
      <a href="${searchUrl}" style="display:inline-block;margin-top:20px;background:#2c6847;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:14px;font-weight:700">
        Abrir busqueda
      </a>
    </div>
  `;

  return {
    subject: `BienesRaicesCR: ${headlineCount} novedades para ${savedSearch.name}`,
    text,
    html
  };
};

const buildPasswordResetEmail = ({ user, resetUrl }) => {
  const subject = "BienesRaicesCR: recupera el acceso a tu cuenta";
  const text = [
    `Hola ${user.name || "cliente"},`,
    "",
    "Recibimos una solicitud para restablecer tu contrasena en BienesRaicesCR.",
    "Si fuiste tu, abre este enlace para crear una nueva contrasena:",
    resetUrl,
    "",
    "Este enlace expira en 30 minutos.",
    "Si no solicitaste este cambio, puedes ignorar este correo."
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2d3d;line-height:1.6">
      <h2 style="margin-bottom:8px">Recupera el acceso a tu cuenta</h2>
      <p>Hola ${user.name || "cliente"}, recibimos una solicitud para restablecer tu contrasena en <strong>BienesRaicesCR</strong>.</p>
      <p>Si fuiste tu, abre el siguiente enlace para crear una nueva contrasena. El enlace expira en 30 minutos.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#2c6847;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:14px;font-weight:700">
        Restablecer contrasena
      </a>
      <p style="margin-top:18px">Si el boton no abre, copia y pega este enlace en tu navegador:</p>
      <p style="word-break:break-all;color:#0f4ea9">${resetUrl}</p>
      <p style="margin-top:16px">Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  `;

  return { subject, text, html };
};

export const notificationService = {
  async sendLeadNotification({ lead, property, recipient }) {
    if (!recipient?.email) {
      return { delivered: false, mode: "skipped" };
    }

    const email = buildLeadEmail({
      lead,
      property,
      recipientName: recipient.name
    });

    return mailService.sendEmail({
      to: recipient.email,
      ...email
    });
  },

  async sendSavedSearchAlert({ user, savedSearch, alertPreview, searchUrl }) {
    if (!user?.email) {
      return { delivered: false, mode: "skipped" };
    }

    const email = buildSavedSearchAlertEmail({
      user,
      savedSearch,
      alertPreview,
      searchUrl
    });

    return mailService.sendEmail({
      to: user.email,
      ...email
    });
  },

  async sendPasswordReset({ user, resetUrl }) {
    if (!user?.email) {
      return { delivered: false, mode: "skipped" };
    }

    const email = buildPasswordResetEmail({ user, resetUrl });

    return mailService.sendEmail({
      to: user.email,
      ...email
    });
  }
};
