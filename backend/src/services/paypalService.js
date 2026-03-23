import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
  PaypalExperienceUserAction
} from "@paypal/paypal-server-sdk";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const toSdkShape = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => toSdkShape(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase()),
      toSdkShape(nestedValue)
    ])
  );
};

const getSdkEnvironment = () =>
  env.PAYPAL_ENVIRONMENT === "live" ? Environment.Production : Environment.Sandbox;

const ensureConfigured = () => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(503, "PayPal no esta configurado todavia en el backend.");
  }
};

const readSdkErrorPayload = (error) => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if (error.result && typeof error.result === "object") {
    return error.result;
  }

  if (typeof error.body === "string") {
    try {
      return JSON.parse(error.body);
    } catch (_parseError) {
      return { message: error.body };
    }
  }

  return undefined;
};

let ordersControllerCache = null;

const getOrdersController = () => {
  ensureConfigured();

  if (ordersControllerCache) {
    return ordersControllerCache;
  }

  const client = new Client({
    environment: getSdkEnvironment(),
    clientCredentialsAuthCredentials: {
      oAuthClientId: env.PAYPAL_CLIENT_ID,
      oAuthClientSecret: env.PAYPAL_CLIENT_SECRET
    }
  });

  ordersControllerCache = new OrdersController(client);
  return ordersControllerCache;
};

const handleSdkError = (error, fallbackMessage) => {
  if (error instanceof ApiError) {
    throw error;
  }

  const payload = readSdkErrorPayload(error);

  throw new ApiError(
    error?.statusCode || 502,
    payload?.message || payload?.error_description || error?.message || fallbackMessage,
    payload
  );
};

export const paypalService = {
  isConfigured() {
    return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
  },

  getEnvironment() {
    return env.PAYPAL_ENVIRONMENT || "sandbox";
  },

  async createOrder({ intent = "CAPTURE", purchaseUnits, returnUrl, cancelUrl, requestId }) {
    try {
      const ordersController = getOrdersController();
      const { result } = await ordersController.createOrder({
        paypalRequestId: requestId,
        prefer: "return=representation",
        body: toSdkShape({
          intent:
            intent === "AUTHORIZE"
              ? CheckoutPaymentIntent.Authorize
              : CheckoutPaymentIntent.Capture,
          purchase_units: purchaseUnits,
          payment_source: {
            paypal: {
              experience_context: {
                brand_name: "BienesRaicesCR",
                user_action: PaypalExperienceUserAction.PayNow,
                return_url: returnUrl,
                cancel_url: cancelUrl
              }
            }
          }
        })
      });

      return result;
    } catch (error) {
      handleSdkError(error, "No se pudo crear la orden de PayPal.");
    }
  },

  async captureOrder(orderId, requestId) {
    try {
      const ordersController = getOrdersController();
      const { result } = await ordersController.captureOrder({
        id: orderId,
        paypalRequestId: requestId,
        prefer: "return=representation"
      });

      return result;
    } catch (error) {
      handleSdkError(error, "No se pudo capturar la orden de PayPal.");
    }
  }
};
