import { enMessages } from "./en";
import { viMessages } from "./vi";
import type { AppLanguage } from "../model/language";

export const messages = {
  vi: viMessages,
  en: enMessages,
} satisfies Record<AppLanguage, AppMessages>;

type WidenMessages<T> = T extends string
  ? string
  : { [K in keyof T]: WidenMessages<T[K]> };

export type AppMessages = WidenMessages<typeof viMessages>;
