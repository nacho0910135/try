const CONSENT_KEY = "bienesraicescr-cookie-consent";
const CONSENT_EVENT = "bienesraicescr-cookie-consent-change";
const OPEN_PREFERENCES_EVENT = "bienesraicescr-cookie-preferences-open";

export const analyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
};

export const cookieConsentValues = {
  accepted: "accepted",
  essential: "essential"
};

export const getStoredCookieConsent = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CONSENT_KEY);
};

export const hasAnalyticsConsent = () =>
  getStoredCookieConsent() === cookieConsentValues.accepted;

export const setCookieConsent = (value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
};

export const openCookiePreferences = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
};

export const disableAnalyticsTracking = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (analyticsConfig.gaMeasurementId) {
    window[`ga-disable-${analyticsConfig.gaMeasurementId}`] = true;
  }

  if (window.posthog?.opt_out_capturing) {
    window.posthog.opt_out_capturing();
  }
};

export const enableAnalyticsTracking = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (analyticsConfig.gaMeasurementId) {
    window[`ga-disable-${analyticsConfig.gaMeasurementId}`] = false;
  }

  if (window.posthog?.opt_in_capturing) {
    window.posthog.opt_in_capturing();
  }
};

export const trackEvent = (name, properties = {}) => {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) {
    return;
  }

  const payload = {
    path: `${window.location.pathname}${window.location.search}`,
    ...properties
  };

  if (typeof window.gtag === "function" && analyticsConfig.gaMeasurementId) {
    window.gtag("event", name, payload);
  }

  if (window.posthog?.capture && analyticsConfig.posthogKey) {
    window.posthog.capture(name, payload);
  }
};

export const analyticsEvents = {
  pageViewed: "page_viewed",
  propertyViewed: "property_viewed",
  favoriteAdded: "favorite_added",
  favoriteRemoved: "favorite_removed",
  leadSubmitted: "lead_submitted",
  offerSubmitted: "offer_submitted",
  propertyCreated: "property_created",
  propertyUpdated: "property_updated"
};

export const analyticsEventNames = {
  consentChanged: CONSENT_EVENT,
  openPreferences: OPEN_PREFERENCES_EVENT
};
