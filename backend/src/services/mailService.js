import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

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
      return {
        delivered: false,
        mode: "unconfigured"
      };
    }

    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text,
        html
      });
    } catch (error) {
      transporterPromise = undefined;
      logger.error("mail_send_failed", {
        to,
        subject,
        smtpHost: env.SMTP_HOST,
        mode: "smtp",
        error
      });
      return {
        delivered: false,
        mode: "smtp-error"
      };
    }

    return {
      delivered: true,
      mode: "smtp"
    };
  }
};
