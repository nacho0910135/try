"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "alquiventascr-language";

const translations = {
  es: {
    home: "Inicio",
    explore: "Explorar",
    favorites: "Favoritos",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Salir",
    search: "Buscar",
    login: "Entrar"
  },
  en: {
    home: "Home",
    explore: "Explore",
    favorites: "Favorites",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Log out",
    search: "Search",
    login: "Sign in"
  }
};

const LanguageContext = createContext({
  language: "es",
  setLanguage: () => {},
  t: (key) => translations.es[key] || key
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (storedLanguage === "en" || storedLanguage === "es") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language]?.[key] || translations.es[key] || key
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
