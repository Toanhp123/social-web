"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  APP_LANGUAGE_STORAGE_KEY,
  APP_LANGUAGE_COOKIE_NAME,
  DEFAULT_APP_LANGUAGE,
  isAppLanguage,
  type AppLanguage,
} from "../model/language";

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  initialLanguage: AppLanguage;
};

export function I18nProvider({
  children,
  initialLanguage,
}: I18nProviderProps) {
  const [language, setLanguage] = useState<AppLanguage>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
    document.cookie = `${APP_LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
  }, [language]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== APP_LANGUAGE_STORAGE_KEY) return;

      setLanguage(
        isAppLanguage(event.newValue) ? event.newValue : DEFAULT_APP_LANGUAGE,
      );
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
