import { SUBSCRIPTION_PLAN_NAMES } from "./enums.js";

export const COMMERCIAL_PLAN_CONFIG = {
  free: {
    id: "free",
    name: "Gratis",
    monthlyPrice: 0,
    yearlyPrice: 0,
    propertyLimit: 1,
    promotedSlots: 0,
    leadInbox: false,
    offersInbox: false,
    analytics: false,
    adMetrics: false,
    features: [
      "Busqueda ilimitada",
      "Favoritos y comparativas",
      "1 propiedad activa como prueba"
    ]
  },
  "owner-plus": {
    id: "owner-plus",
    name: "Propietario Plus",
    monthlyPrice: 14,
    yearlyPrice: 132,
    propertyLimit: 5,
    promotedSlots: 1,
    leadInbox: true,
    offersInbox: true,
    analytics: true,
    adMetrics: true,
    features: [
      "Hasta 5 propiedades activas",
      "Leads y ofertas recibidas",
      "Metricas por propiedad",
      "1 anuncio destacado"
    ]
  },
  "agent-pro": {
    id: "agent-pro",
    name: "Agente Pro",
    monthlyPrice: 39,
    yearlyPrice: 390,
    propertyLimit: 40,
    promotedSlots: 6,
    leadInbox: true,
    offersInbox: true,
    analytics: true,
    adMetrics: true,
    features: [
      "Hasta 40 propiedades activas",
      "Funnel comercial y leads",
      "Ofertas, comparables y analitica",
      "Hasta 6 anuncios destacados"
    ]
  },
  "broker-max": {
    id: "broker-max",
    name: "Broker Max",
    monthlyPrice: 89,
    yearlyPrice: 890,
    propertyLimit: 250,
    promotedSlots: 30,
    leadInbox: true,
    offersInbox: true,
    analytics: true,
    adMetrics: true,
    features: [
      "Hasta 250 propiedades activas",
      "Equipo comercial y marca",
      "Analitica avanzada",
      "30 anuncios destacados"
    ]
  }
};

const TRIAL_DAYS_BY_PLAN = {
  free: 0,
  "owner-plus": 30,
  "agent-pro": 30,
  "broker-max": 30
};

export const getCommercialPlanCatalog = () =>
  SUBSCRIPTION_PLAN_NAMES.map((planId) => COMMERCIAL_PLAN_CONFIG[planId]);

export const getDefaultPlanIdForRole = (role) => {
  switch (role) {
    case "owner":
      return "owner-plus";
    case "agent":
      return "agent-pro";
    case "admin":
      return "broker-max";
    default:
      return "free";
  }
};

export const buildDefaultSubscriptionForRole = (role, now = new Date()) => {
  const planId = getDefaultPlanIdForRole(role);
  const plan = COMMERCIAL_PLAN_CONFIG[planId];
  const trialDays = TRIAL_DAYS_BY_PLAN[planId] || 0;
  const trialEndsAt =
    trialDays > 0 ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : undefined;

  return {
    plan: plan.id,
    status: planId === "free" ? "active" : role === "admin" ? "active" : "trial",
    billingCycle: "monthly",
    monthlyPrice: plan.monthlyPrice,
    propertyLimit: plan.propertyLimit,
    promotedSlots: plan.promotedSlots,
    startedAt: now,
    trialEndsAt
  };
};

export const resolveEffectiveSubscription = (user) => {
  const fallback = buildDefaultSubscriptionForRole(user?.role);
  const planId = user?.subscription?.plan || fallback.plan;
  const plan = COMMERCIAL_PLAN_CONFIG[planId] || COMMERCIAL_PLAN_CONFIG.free;

  return {
    ...fallback,
    ...user?.subscription,
    plan: plan.id,
    label: plan.name,
    monthlyPrice: user?.subscription?.monthlyPrice ?? plan.monthlyPrice,
    propertyLimit: user?.subscription?.propertyLimit ?? plan.propertyLimit,
    promotedSlots: user?.subscription?.promotedSlots ?? plan.promotedSlots,
    features: plan.features,
    leadInbox: plan.leadInbox,
    offersInbox: plan.offersInbox,
    analytics: plan.analytics,
    adMetrics: plan.adMetrics
  };
};
