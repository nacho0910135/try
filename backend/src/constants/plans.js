import { SUBSCRIPTION_PLAN_NAMES } from "./enums.js";

export const COMMERCIAL_PLAN_CONFIG = {
  free: {
    id: "free",
    name: "Acceso libre",
    monthlyPrice: 0,
    yearlyPrice: 0,
    propertyLimit: 9999,
    promotedSlots: 0,
    leadInbox: true,
    offersInbox: true,
    analytics: true,
    adMetrics: true,
    features: [
      "Publicacion gratuita",
      "Exploracion y favoritos sin costo",
      "Leads, ofertas y metricas incluidos",
      "Los destacados se gestionan como boost aparte"
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

const FREE_ONLY_PLAN_ID = "free";

export const getCommercialPlanCatalog = () =>
  SUBSCRIPTION_PLAN_NAMES.filter((planId) => planId === FREE_ONLY_PLAN_ID).map(
    (planId) => COMMERCIAL_PLAN_CONFIG[planId]
  );

export const getDefaultPlanIdForRole = () => FREE_ONLY_PLAN_ID;

export const buildDefaultSubscriptionForRole = (_role, now = new Date()) => {
  const planId = getDefaultPlanIdForRole();
  const plan = COMMERCIAL_PLAN_CONFIG[planId];

  return {
    plan: plan.id,
    status: "active",
    billingCycle: "monthly",
    monthlyPrice: plan.monthlyPrice,
    propertyLimit: plan.propertyLimit,
    promotedSlots: plan.promotedSlots,
    startedAt: now
  };
};

export const resolveEffectiveSubscription = (user) => {
  const fallback = buildDefaultSubscriptionForRole(user?.role);
  const plan = COMMERCIAL_PLAN_CONFIG[FREE_ONLY_PLAN_ID];

  return {
    ...fallback,
    ...user?.subscription,
    plan: plan.id,
    label: plan.name,
    status: "active",
    billingCycle: "monthly",
    monthlyPrice: plan.monthlyPrice,
    propertyLimit: plan.propertyLimit,
    promotedSlots: plan.promotedSlots,
    trialEndsAt: undefined,
    features: plan.features,
    leadInbox: plan.leadInbox,
    offersInbox: plan.offersInbox,
    analytics: plan.analytics,
    adMetrics: plan.adMetrics
  };
};
