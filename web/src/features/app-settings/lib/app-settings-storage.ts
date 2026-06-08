import {
  APP_THEME_COOKIE_NAME,
  APP_FONT_SIZE_STORAGE_KEY,
  APP_NOTIFICATION_SETTINGS_STORAGE_KEY,
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_FONT_SIZE,
  DEFAULT_NOTIFICATION_SETTINGS,
  MAX_APP_FONT_SIZE,
  MIN_APP_FONT_SIZE,
  type AppFontSize,
  type AppTheme,
  type NotificationSettings,
} from "../model/app-settings";

export function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "system";

  const storedTheme =
    readCookie(APP_THEME_COOKIE_NAME) ?? localStorage.getItem(APP_THEME_STORAGE_KEY);

  return isAppTheme(storedTheme) ? storedTheme : "system";
}

export function persistTheme(theme: AppTheme) {
  localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  document.cookie = `${APP_THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function readStoredFontSize(): AppFontSize {
  if (typeof window === "undefined") return DEFAULT_APP_FONT_SIZE;

  const storedFontSize = localStorage.getItem(APP_FONT_SIZE_STORAGE_KEY);

  return normalizeFontSize(storedFontSize);
}

export function persistFontSize(fontSize: AppFontSize) {
  localStorage.setItem(APP_FONT_SIZE_STORAGE_KEY, String(fontSize));
}

export function readStoredNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;

  try {
    const storedSettings = localStorage.getItem(
      APP_NOTIFICATION_SETTINGS_STORAGE_KEY,
    );

    if (!storedSettings) return DEFAULT_NOTIFICATION_SETTINGS;

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(JSON.parse(storedSettings) as Partial<NotificationSettings>),
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function persistNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(
    APP_NOTIFICATION_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function applyTheme(theme: AppTheme) {
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

export function applyFontSize(fontSize: AppFontSize) {
  document.documentElement.style.setProperty(
    "--app-font-size",
    `${normalizeFontSize(fontSize)}px`,
  );
}

function isAppTheme(value: string | null): value is AppTheme {
  return value === "system" || value === "light" || value === "dark";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function normalizeFontSize(value: unknown): AppFontSize {
  const parsedValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsedValue)) return DEFAULT_APP_FONT_SIZE;

  return Math.min(
    MAX_APP_FONT_SIZE,
    Math.max(MIN_APP_FONT_SIZE, Math.round(parsedValue)),
  );
}
