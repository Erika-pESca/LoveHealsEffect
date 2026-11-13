"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { homeDictionary, Locale } from "@/i18n/homeDictionary";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  dict: typeof homeDictionary.es;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lhe-lang") as Locale | null;
      if (saved === "en" || saved === "es") {
        setLocaleState(saved);
      }
    } catch {}
  }, []);

  const setLocale = (lang: Locale) => {
    setLocaleState(lang);
    try {
      localStorage.setItem("lhe-lang", lang);
      document.documentElement.lang = lang;
    } catch {}
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        dict: homeDictionary[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

