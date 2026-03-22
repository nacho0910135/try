import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { COMMERCIAL_PLAN_CONFIG, resolveEffectiveSubscription } from "../constants/plans.js";
import { stripeService } from "./stripeService.js";

const BILLING_CYCLES = {
  monthly: "month",
  yearly: "year"
};

const getFrontendBaseUrl = () => env.FRONTEND_URL.split(",")[0] || "http://localhost:3000";

const isPaidPlan = (planId) => Number(COMMERCIAL_PLAN_CONFIG[planId]?.monthlyPrice || 0) > 0;

const buildUnitAmount = (planId, billingCycle) => {
  const plan = COMMERCIAL_PLAN_CONFIG[planId];

  if (!plan) {
    return 0;
  }

  if (billingCycle === "yearly") {
    return Number(plan.yearlyPrice || 0) * 100;
  }

  return Number(plan.monthlyPrice || 0) * 100;
};

const buildPlanMetadata = ({ userId, planId, billingCycle }) => ({
  userId: String(userId),
  plan: planId,
  billingCycle
});

const mapStripeSubscriptionStatus = (status) => {
  if (status === "trialing") {
    return "trial";
  }

  if (status === "active") {
    return "active";
  }

  return "inactive";
};

const applySubscriptionToUser = async ({
  user,
  planId,
  billingCycle = "monthly",
  stripeCustomerId = "",
  stripeSubscriptionId = "",
  status = "active",
  currentPeriodEnd,
  cancelAtPeriodEnd = false
}) => {
  const plan = COMMERCIAL_PLAN_CONFIG[planId] || COMMERCIAL_PLAN_CONFIG.free;

  user.subscription = {
    ...(user.subscription || {}),
    plan: plan.id,
    status,
    billingCycle,
    monthlyPrice: billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice,
    propertyLimit: plan.propertyLimit,
    promotedSlots: plan.promotedSlots,
    stripeCustomerId: stripeCustomerId || user.subscription?.stripeCustomerId || "",
    stripeSubscriptionId: stripeSubscriptionId || user.subscription?.stripeSubscriptionId || "",
    currentPeriodEnd,
    cancelAtPeriodEnd,
    startedAt: user.subscription?.startedAt || new Date(),
    trialEndsAt: undefined
  };

  await user.save();
  return resolveEffectiveSubscription(user);
};

export const billingService = {
  getPublicStatus(user) {
    const subscription = resolveEffectiveSubscription(user);
    return {
      configured: stripeService.isConfigured(),
      webhookConfigured: stripeService.hasWebhookSecret(),
      hasStripeCustomer: Boolean(subscription.stripeCustomerId),
      hasActivePaidPlan:
        Boolean(subscription.stripeSubscriptionId) &&
        isPaidPlan(subscription.plan) &&
        ["active", "trial"].includes(subscription.status),
      subscription
    };
  },

  async createCheckoutSession(user, payload) {
    const stripe = await stripeService.getClient();

    if (!stripe) {
      throw new ApiError(503, "Stripe no esta configurado todavia en el backend.");
    }

    const plan = COMMERCIAL_PLAN_CONFIG[payload.plan];

    if (!plan || !isPaidPlan(plan.id)) {
      throw new ApiError(400, "Selecciona un plan pago para continuar al checkout.");
    }

    if (user.subscription?.stripeSubscriptionId && isPaidPlan(user.subscription?.plan)) {
      throw new ApiError(
        400,
        "Ya tienes una suscripcion paga activa. Usa el portal de billing para cambiarla."
      );
    }

    const billingCycle = payload.billingCycle || "monthly";
    const unitAmount = buildUnitAmount(plan.id, billingCycle);

    if (!unitAmount) {
      throw new ApiError(400, "Ese plan no tiene precio valido para checkout.");
    }

    const customerId = user.subscription?.stripeCustomerId || undefined;
    const metadata = buildPlanMetadata({
      userId: user._id,
      planId: plan.id,
      billingCycle
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${getFrontendBaseUrl()}/dashboard/business?checkout=success`,
      cancel_url: `${getFrontendBaseUrl()}/dashboard/business?checkout=cancel`,
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      allow_promotion_codes: true,
      metadata,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            recurring: {
              interval: BILLING_CYCLES[billingCycle] || "month"
            },
            unit_amount: unitAmount,
            product_data: {
              name: `AlquiVentasCR - ${plan.name}`,
              description: plan.features.join(" • "),
              metadata
            }
          }
        }
      ],
      subscription_data: {
        metadata
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  },

  async createPortalSession(user) {
    const stripe = await stripeService.getClient();

    if (!stripe) {
      throw new ApiError(503, "Stripe no esta configurado todavia en el backend.");
    }

    const customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      throw new ApiError(400, "Todavia no existe un cliente de billing para este usuario.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getFrontendBaseUrl()}/dashboard/business`
    });

    return {
      url: session.url
    };
  },

  async handleWebhook(rawBody, signature) {
    const event = await stripeService.constructWebhookEvent(rawBody, signature);

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }

    return { received: true };
  },

  async handleCheckoutCompleted(session) {
    if (session.mode !== "subscription") {
      return;
    }

    const userId = session.metadata?.userId;

    if (!userId) {
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    const stripe = await stripeService.getClient();
    const subscription = session.subscription
      ? await stripe.subscriptions.retrieve(session.subscription)
      : null;

    await applySubscriptionToUser({
      user,
      planId: session.metadata?.plan || user.subscription?.plan || "free",
      billingCycle: session.metadata?.billingCycle || "monthly",
      stripeCustomerId: String(session.customer || ""),
      stripeSubscriptionId: String(session.subscription || ""),
      status: mapStripeSubscriptionStatus(subscription?.status),
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end)
    });
  },

  async handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      const existingUser = await User.findOne({
        "subscription.stripeSubscriptionId": subscription.id
      });

      if (!existingUser) {
        return;
      }

      await applySubscriptionToUser({
        user: existingUser,
        planId: existingUser.subscription?.plan || "free",
        billingCycle: existingUser.subscription?.billingCycle || "monthly",
        stripeCustomerId: String(subscription.customer || ""),
        stripeSubscriptionId: String(subscription.id || ""),
        status: mapStripeSubscriptionStatus(subscription.status),
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    await applySubscriptionToUser({
      user,
      planId: subscription.metadata?.plan || user.subscription?.plan || "free",
      billingCycle: subscription.metadata?.billingCycle || user.subscription?.billingCycle || "monthly",
      stripeCustomerId: String(subscription.customer || ""),
      stripeSubscriptionId: String(subscription.id || ""),
      status: mapStripeSubscriptionStatus(subscription.status),
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
    });
  },

  async handleSubscriptionDeleted(subscription) {
    const user =
      (await User.findOne({
        "subscription.stripeSubscriptionId": subscription.id
      })) ||
      (subscription.metadata?.userId
        ? await User.findById(subscription.metadata.userId)
        : null);

    if (!user) {
      return;
    }

    await applySubscriptionToUser({
      user,
      planId: "free",
      billingCycle: "monthly",
      stripeCustomerId: String(subscription.customer || user.subscription?.stripeCustomerId || ""),
      stripeSubscriptionId: "",
      status: "active",
      currentPeriodEnd: undefined,
      cancelAtPeriodEnd: false
    });
  }
};
