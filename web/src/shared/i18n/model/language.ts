export const APP_LANGUAGE_STORAGE_KEY = "social-web:language";
export const APP_LANGUAGE_COOKIE_NAME = "social-web-language";

export const APP_LANGUAGES = ["vi", "en"] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const DEFAULT_APP_LANGUAGE: AppLanguage = "vi";

export const APP_LANGUAGE_LABELS: Record<AppLanguage, string> = {
  vi: "Tieng Viet",
  en: "English",
};

export function isAppLanguage(value: unknown): value is AppLanguage {
  return APP_LANGUAGES.includes(value as AppLanguage);
}
