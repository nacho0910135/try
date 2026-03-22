import rateLimit from "express-rate-limit";

const jsonLimitHandler = (message) => ({
  success: false,
  message
});

const createLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(jsonLimitHandler(message));
    }
  });

export const authRegisterLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  message: "Demasiados intentos de registro. Intenta de nuevo en unos minutos."
});

export const authLoginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Demasiados intentos de inicio de sesion. Espera un momento e intenta de nuevo."
});

export const authRecoveryLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  message: "Se alcanzo el limite de recuperaciones por hora. Intenta mas tarde."
});

export const leadCreateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 25,
  message: "Has enviado demasiados contactos por hora. Espera un poco antes de continuar."
});

export const propertySearchLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 240,
  message: "Demasiadas busquedas en poco tiempo. Intenta nuevamente en unos minutos."
});

export const savedSearchWriteLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: "Demasiadas acciones sobre alertas y busquedas guardadas. Intenta nuevamente pronto."
});

export const uploadImagesLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: "Demasiadas cargas de imagenes por hora. Espera antes de seguir."
});

export const analysisInteractionLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: "Demasiadas interacciones de analisis en poco tiempo. Intenta nuevamente pronto."
});
