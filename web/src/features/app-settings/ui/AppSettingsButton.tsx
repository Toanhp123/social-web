"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  Languages,
  MessageCircle,
  Monitor,
  Moon,
  Settings,
  Sun,
  ThumbsUp,
} from "lucide-react";
import { useI18n, useTranslations, type AppLanguage } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import {
  APP_NOTIFICATION_SETTINGS_STORAGE_KEY,
  APP_THEME_STORAGE_KEY,
  DEFAULT_NOTIFICATION_SETTINGS,
  type AppTheme,
  type NotificationSettings,
} from "../model/app-settings";

const themeOptions: Array<{
  value: AppTheme;
  icon: typeof Monitor;
}> = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

const languageOptions: Array<{
  value: AppLanguage;
  label: string;
}> = [
  { value: "vi", label: "VI" },
  { value: "en", label: "EN" },
];

const notificationOptions: Array<{
  key: keyof NotificationSettings;
  icon: typeof Bell;
}> = [
  { key: "inApp", icon: Bell },
  { key: "comments", icon: MessageCircle },
  { key: "reactions", icon: ThumbsUp },
];

export function AppSettingsButton() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => readStoredTheme());
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(() => readStoredNotificationSettings());
  const copy = useTranslations().settings;

  const activeThemeLabel = useMemo(
    () => copy.themeOptions[theme],
    [copy.themeOptions, theme],
  );

  const activeLanguageLabel = useMemo(
    () => copy.languageOptions[language],
    [copy.languageOptions, language],
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(APP_THEME_STORAGE_KEY, theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      APP_NOTIFICATION_SETTINGS_STORAGE_KEY,
      JSON.stringify(notificationSettings),
    );
  }, [notificationSettings]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function toggleNotification(key: keyof NotificationSettings) {
    setNotificationSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="rounded-pill border-subtle bg-surface text-secondary hover:text-brand grid size-10 place-items-center border shadow-sm transition"
        aria-label={copy.settingsLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Settings className="size-4" />
      </button>

      {isOpen && (
        <div className="rounded-card border-subtle bg-surface shadow-popover absolute right-0 z-40 mt-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden border">
          <div className="border-soft border-b px-4 py-3">
            <p className="text-primary text-sm font-semibold">
              {copy.settings}
            </p>
            <p className="text-muted mt-0.5 text-xs">{copy.description}</p>
          </div>

          <div className="space-y-5 p-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-primary text-sm font-medium">{copy.theme}</p>
                <span className="text-muted text-xs font-medium">
                  {activeThemeLabel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "rounded-control flex min-h-20 flex-col items-center justify-center gap-2 border px-2 text-xs font-medium transition",
                        isSelected
                          ? "border-brand-soft bg-brand-soft text-brand-strong"
                          : "border-subtle bg-surface-soft text-secondary hover:border-brand hover:bg-surface",
                      )}
                      onClick={() => setTheme(option.value)}
                    >
                      <Icon className="size-4" />
                      {copy.themeOptions[option.value]}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-primary text-sm font-medium">
                  {copy.language}
                </p>
                <span className="text-muted text-xs font-medium">
                  {activeLanguageLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((option) => {
                  const isSelected = language === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "rounded-control flex min-h-14 items-center justify-center gap-2 border px-3 text-sm font-medium transition",
                        isSelected
                          ? "border-brand-soft bg-brand-soft text-brand-strong"
                          : "border-subtle bg-surface-soft text-secondary hover:border-brand hover:bg-surface",
                      )}
                      onClick={() => setLanguage(option.value)}
                    >
                      <Languages className="size-4" />
                      <span>{copy.languageOptions[option.value]}</span>
                      <span className="text-muted text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <p className="text-primary text-sm font-medium">
                  {copy.notifications}
                </p>
                <p className="text-muted mt-0.5 text-xs leading-5">
                  {copy.notificationsDescription}
                </p>
              </div>

              <div className="space-y-2">
                {notificationOptions.map((option) => {
                  const Icon = option.icon;
                  const isEnabled = notificationSettings[option.key];

                  return (
                    <button
                      key={option.key}
                      type="button"
                      className="rounded-control border-subtle bg-surface-soft hover:bg-surface flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition"
                      onClick={() => toggleNotification(option.key)}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="rounded-control bg-surface-muted text-secondary grid size-9 shrink-0 place-items-center">
                          <Icon className="size-4" />
                        </span>
                        <span className="text-secondary truncate text-sm font-medium">
                          {copy.notificationOptions[option.key]}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "rounded-pill grid size-6 shrink-0 place-items-center border transition",
                          isEnabled
                            ? "border-brand bg-brand text-inverse"
                            : "border-subtle bg-surface text-muted",
                        )}
                      >
                        {isEnabled && <Check className="size-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "system";

  const storedTheme = localStorage.getItem(APP_THEME_STORAGE_KEY);

  return isAppTheme(storedTheme) ? storedTheme : "system";
}

function readStoredNotificationSettings(): NotificationSettings {
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

function isAppTheme(value: string | null): value is AppTheme {
  return value === "system" || value === "light" || value === "dark";
}

function applyTheme(theme: AppTheme) {
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}
