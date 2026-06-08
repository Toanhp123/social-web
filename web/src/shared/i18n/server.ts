import { cookies } from "next/headers";
import {
  APP_LANGUAGE_COOKIE_NAME,
  DEFAULT_APP_LANGUAGE,
  isAppLanguage,
  type AppLanguage,
} from "./model/language";
import { messages } from "./messages";

export async function getServerLanguage(): Promise<AppLanguage> {
  const cookieStore = await cookies();
  const language = cookieStore.get(APP_LANGUAGE_COOKIE_NAME)?.value;

  return isAppLanguage(language) ? language : DEFAULT_APP_LANGUAGE;
}

export async function getServerTranslations() {
  const language = await getServerLanguage();

  return messages[language];
}
