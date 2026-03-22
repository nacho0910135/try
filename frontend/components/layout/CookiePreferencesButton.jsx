"use client";

import { openCookiePreferences } from "@/lib/analytics";
import { useLanguage } from "./LanguageProvider";

export function CookiePreferencesButton({ className = "" }) {
  const { language } = useLanguage();

  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={`text-left transition hover:text-pine ${className}`.trim()}
    >
      {language === "en" ? "Cookie preferences" : "Preferencias de cookies"}
    </button>
  );
}
