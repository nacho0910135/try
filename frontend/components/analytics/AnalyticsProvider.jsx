"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  analyticsConfig,
  analyticsEventNames,
  cookieConsentValues,
  disableAnalyticsTracking,
  enableAnalyticsTracking,
  getStoredCookieConsent,
  hasAnalyticsConsent
} from "@/lib/analytics";

export function AnalyticsProvider({ children }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState(null);
  const [gaReady, setGaReady] = useState(false);
  const [posthogReady, setPosthogReady] = useState(false);
  const lastTrackedSignature = useRef("");

  const currentSignature = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${pathname}${window.location.search}`;
    }

    return pathname;
  }, [pathname]);

  useEffect(() => {
    setConsent(getStoredCookieConsent());

    const onConsentChange = (event) => {
      setConsent(event.detail || getStoredCookieConsent());
    };

    window.addEventListener(analyticsEventNames.consentChanged, onConsentChange);

    return () => {
      window.removeEventListener(analyticsEventNames.consentChanged, onConsentChange);
    };
  }, []);

  useEffect(() => {
    if (consent === cookieConsentValues.accepted) {
      enableAnalyticsTracking();
      return;
    }

    if (consent === cookieConsentValues.essential) {
      disableAnalyticsTracking();
    }
  }, [consent]);

  useEffect(() => {
    if (!hasAnalyticsConsent()) {
      return;
    }

    const gaAvailable = analyticsConfig.gaMeasurementId ? gaReady : true;
    const posthogAvailable = analyticsConfig.posthogKey ? posthogReady : true;

    if (!gaAvailable || !posthogAvailable) {
      return;
    }

    if (lastTrackedSignature.current === currentSignature) {
      return;
    }

    lastTrackedSignature.current = currentSignature;

    if (typeof window.gtag === "function" && analyticsConfig.gaMeasurementId) {
      window.gtag("event", "page_view", {
        page_path: currentSignature,
        page_location: window.location.href,
        page_title: document.title
      });
    }

    if (window.posthog?.capture && analyticsConfig.posthogKey) {
      window.posthog.capture("$pageview", {
        path: currentSignature,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, [currentSignature, gaReady, posthogReady]);

  const shouldLoadAnalytics = consent === cookieConsentValues.accepted;

  return (
    <>
      {shouldLoadAnalytics && analyticsConfig.gaMeasurementId ? (
        <Script
          id="ga-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaMeasurementId}`}
          strategy="afterInteractive"
          onLoad={() => {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag() {
              window.dataLayer.push(arguments);
            };
            window.gtag("js", new Date());
            window.gtag("config", analyticsConfig.gaMeasurementId, {
              anonymize_ip: true,
              send_page_view: false
            });
            setGaReady(true);
          }}
        />
      ) : null}

      {shouldLoadAnalytics && analyticsConfig.posthogKey ? (
        <Script
          id="posthog-loader"
          src={`${analyticsConfig.posthogHost.replace(/\/$/, "")}/static/array.js`}
          strategy="afterInteractive"
          onLoad={() => {
            if (window.posthog?.init) {
              window.posthog.init(analyticsConfig.posthogKey, {
                api_host: analyticsConfig.posthogHost,
                capture_pageview: false,
                autocapture: true,
                persistence: "localStorage+cookie"
              });
              setPosthogReady(true);
            }
          }}
        />
      ) : null}

      {children}
    </>
  );
}
