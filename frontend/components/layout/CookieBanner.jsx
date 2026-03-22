"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  analyticsEventNames,
  cookieConsentValues,
  getStoredCookieConsent,
  setCookieConsent
} from "@/lib/analytics";
import { useLanguage } from "./LanguageProvider";

const copy = {
  es: {
    title: "Preferencias de cookies",
    description:
      "Usamos cookies esenciales para el funcionamiento del sitio y, si nos autorizas, cookies de analitica para medir visitas, favoritos, leads y conversiones.",
    accept: "Aceptar analitica",
    essential: "Solo esenciales",
    legal: "Politica de cookies",
    privacy: "Privacidad"
  },
  en: {
    title: "Cookie preferences",
    description:
      "We use essential cookies to run the site and, if you allow it, analytics cookies to measure visits, favorites, leads, and conversions.",
    accept: "Accept analytics",
    essential: "Essentials only",
    legal: "Cookie policy",
    privacy: "Privacy"
  }
};

export function CookieBanner() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const text = copy[language] || copy.es;

  useEffect(() => {
    setVisible(!getStoredCookieConsent());

    const onOpenPreferences = () => {
      setVisible(true);
    };

    window.addEventListener(analyticsEventNames.openPreferences, onOpenPreferences);

    return () => {
      window.removeEventListener(analyticsEventNames.openPreferences, onOpenPreferences);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-[28px] border border-ink/10 bg-white/96 p-5 shadow-[0_28px_60px_rgba(17,34,54,0.18)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">
            {text.title}
          </div>
          <p className="mt-3 text-sm leading-7 text-ink/70">
            {text.description}{" "}
            <Link href="/legal/cookies" className="font-semibold text-pine transition hover:text-lagoon">
              {text.legal}
            </Link>{" "}
            y{" "}
            <Link href="/legal/privacy" className="font-semibold text-pine transition hover:text-lagoon">
              {text.privacy}
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setCookieConsent(cookieConsentValues.essential);
              setVisible(false);
            }}
          >
            {text.essential}
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setCookieConsent(cookieConsentValues.accepted);
              setVisible(false);
            }}
          >
            {text.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
