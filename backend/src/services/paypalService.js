import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const PAYPAL_API_BASES = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com"
};

let accessTokenCache = {
  token: "",
  expiresAt: 0
};

const getApiBaseUrl = () => PAYPAL_API_BASES[env.PAYPAL_ENVIRONMENT] || PAYPAL_API_BASES.sandbox;

const ensureConfigured = () => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(503, "PayPal no esta configurado todavia en el backend.");
  }
};

const readResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return { message: text };
  }
};

const getAccessToken = async () => {
  ensureConfigured();

  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  const authorization = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${getApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const payload = await readResponseBody(response);

  if (!response.ok || !payload.access_token) {
    throw new ApiError(
      response.status || 502,
      payload.error_description || payload.message || "No se pudo autenticar con PayPal.",
      payload
    );
  }

  accessTokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max((Number(payload.expires_in || 0) - 60) * 1000, 60_000)
  };

  return payload.access_token;
};

const paypalRequest = async (path, { method = "GET", body, requestId } = {}) => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status || 502,
      payload.message || payload.error_description || "PayPal devolvio un error.",
      payload
    );
  }

  return payload;
};

export const paypalService = {
  isConfigured() {
    return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
  },

  getEnvironment() {
    return env.PAYPAL_ENVIRONMENT || "sandbox";
  },

  async createOrder({ intent = "CAPTURE", purchaseUnits, returnUrl, cancelUrl, requestId }) {
    return paypalRequest("/v2/checkout/orders", {
      method: "POST",
      requestId,
      body: {
        intent,
        purchase_units: purchaseUnits,
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "BienesRaicesCR",
              user_action: "PAY_NOW",
              return_url: returnUrl,
              cancel_url: cancelUrl
            }
          }
        }
      }
    });
  },

  async captureOrder(orderId, requestId) {
    return paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      requestId
    });
  }
};
