"use client";

import { useLanguage } from "./LanguageProvider";

const options = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" }
];

export function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white/80 p-1 shadow-soft ${className}`.trim()}
      aria-label="Selector de idioma"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            language === option.value
              ? "bg-ink text-white"
              : "text-ink/55 hover:bg-mist hover:text-ink"
          }`}
          aria-pressed={language === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
