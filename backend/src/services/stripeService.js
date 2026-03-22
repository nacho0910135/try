import { env } from "../config/env.js";

let stripePromise;

const getStripe = async () => {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripePromise) {
    stripePromise = import("stripe")
      .then(({ default: Stripe }) => new Stripe(env.STRIPE_SECRET_KEY))
      .catch((error) => {
        console.error("Stripe dependency is not available", error);
        return null;
      });
  }

  return stripePromise;
};

export const stripeService = {
  isConfigured() {
    return Boolean(env.STRIPE_SECRET_KEY);
  },

  hasWebhookSecret() {
    return Boolean(env.STRIPE_WEBHOOK_SECRET);
  },

  async getClient() {
    return getStripe();
  },

  async constructWebhookEvent(rawBody, signature) {
    const stripe = await getStripe();

    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook is not configured");
    }

    return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  }
};
