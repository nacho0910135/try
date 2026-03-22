import { mailService } from "./mailService.js";

const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CRC" ? 0 : 0
  }).format(Number(value || 0));

const buildLeadEmail = ({ lead, property, recipientName }) => {
  const subject = `Nuevo lead para ${property.title} en AlquiVentasCR`;
  const text = [
    `Hola ${recipientName || "equipo"},`,
    "",
    `Recibiste un nuevo lead para: ${property.title}.`,
    `Zona: ${property.address?.district || ""}, ${property.address?.canton || ""}, ${property.address?.province || ""}`.trim(),
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
      <h2 style="margin-bottom:8px">Nuevo lead en AlquiVentasCR</h2>
      <p>Hola ${recipientName || "equipo"}, recibiste un nuevo lead para <strong>${property.title}</strong>.</p>
      <p>
        <strong>Zona:</strong> ${property.address?.district || ""}, ${property.address?.canton || ""}, ${
          property.address?.province || ""
        }<br />
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

const buildSavedSearchAlertEmail = ({ user, savedSearch, alertPreview, searchUrl }) => {
  const subject = `AlquiVentasCR: ${alertPreview.emailMatches || alertPreview.totalMatches} novedades para ${savedSearch.name}`;
  const matches = alertPreview.recentMatches || [];
  const text = [
    `Hola ${user.name || "cliente"},`,
    "",
    `Tu busqueda guardada "${savedSearch.name}" tiene ${
      alertPreview.emailMatches || alertPreview.totalMatches
    } novedades para revisar.`,
    "",
    ...matches.map(
      (property, index) =>
        `${index + 1}. ${property.title} - ${property.address?.district || ""}, ${
          property.address?.canton || ""
        }, ${property.address?.province || ""} - ${formatCurrency(property.price, property.currency)}`
    ),
    "",
    `Explora la zona aqui: ${searchUrl}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2d3d;line-height:1.6">
      <h2 style="margin-bottom:8px">Novedades para tu busqueda guardada</h2>
      <p>Hola ${user.name || "cliente"}, tu busqueda <strong>${savedSearch.name}</strong> tiene <strong>${
        alertPreview.emailMatches || alertPreview.totalMatches
      }</strong> novedades.</p>
      <div style="display:grid;gap:12px;margin:18px 0">
        ${matches
          .map(
            (property) => `
              <div style="border:1px solid #e6ebf0;border-radius:16px;padding:14px;background:#ffffff">
                <div style="font-weight:700">${property.title}</div>
                <div style="font-size:13px;color:#62748a;margin-top:4px">
                  ${property.address?.district || ""}, ${property.address?.canton || ""}, ${
                    property.address?.province || ""
                  }
                </div>
                <div style="margin-top:8px;font-weight:600;color:#2c6847">
                  ${formatCurrency(property.price, property.currency)}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      <a href="${searchUrl}" style="display:inline-block;background:#2c6847;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:14px;font-weight:700">
        Abrir busqueda
      </a>
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
  }
};
