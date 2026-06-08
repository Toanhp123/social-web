import { cookies } from "next/headers";
import {
  APP_THEME_COOKIE_NAME,
  type AppTheme,
} from "./model/app-settings";

export async function getServerTheme(): Promise<AppTheme> {
  const cookieStore = await cookies();
  const theme = cookieStore.get(APP_THEME_COOKIE_NAME)?.value;

  return isAppTheme(theme) ? theme : "system";
}

function isAppTheme(value: unknown): value is AppTheme {
  return value === "system" || value === "light" || value === "dark";
}
