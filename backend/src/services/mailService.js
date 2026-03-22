import { env } from "../config/env.js";

let transporterPromise;

const mailConfigReady = () =>
  Boolean(env.EMAIL_FROM && env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);

const getTransporter = async () => {
  if (!mailConfigReady()) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = import("nodemailer")
      .then(({ default: nodemailer }) =>
        nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: Boolean(env.SMTP_SECURE),
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        })
      )
      .catch((error) => {
        console.error("Mailer dependency is not available", error);
        return null;
      });
  }

  return transporterPromise;
};

export const mailService = {
  isConfigured() {
    return mailConfigReady();
  },

  async sendEmail({ to, subject, text, html }) {
    if (!to) {
      return { delivered: false, mode: "skipped" };
    }

    const transporter = await getTransporter();

    if (!transporter) {
      console.log("[mail:preview]", {
        to,
        subject,
        text
      });

      return {
        delivered: false,
        mode: "preview"
      };
    }

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });

    return {
      delivered: true,
      mode: "smtp"
    };
  }
};
