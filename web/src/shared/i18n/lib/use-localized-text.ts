"use client";

import { useI18n } from "../provider/I18nProvider";
import type { AppLanguage } from "../model/language";
import { messages } from "../messages";

export type LocalizedText<T> = Record<AppLanguage, T>;

export function useLocalizedText<T>(messages: LocalizedText<T>): T {
  const { language } = useI18n();

  return messages[language];
}

export function useTranslations() {
  const { language } = useI18n();

  return messages[language];
}
