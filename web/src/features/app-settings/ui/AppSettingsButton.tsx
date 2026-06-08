"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  MessageCircle,
  Monitor,
  Moon,
  Settings,
  Sun,
  ThumbsUp,
} from "lucide-react";
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
  label: string;
  icon: typeof Monitor;
}> = [
  { value: "system", label: "He thong", icon: Monitor },
  { value: "light", label: "Sang", icon: Sun },
  { value: "dark", label: "Toi", icon: Moon },
];

const notificationOptions: Array<{
  key: keyof NotificationSettings;
  label: string;
  icon: typeof Bell;
}> = [
  { key: "inApp", label: "Thong bao trong ung dung", icon: Bell },
  { key: "comments", label: "Binh luan va tra loi", icon: MessageCircle },
  { key: "reactions", label: "Cam xuc bai viet", icon: ThumbsUp },
];

export function AppSettingsButton() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => readStoredTheme());
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(() => readStoredNotificationSettings());

  const activeThemeLabel = useMemo(
    () => themeOptions.find((option) => option.value === theme)?.label,
    [theme],
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
        className="grid size-10 place-items-center rounded-pill border border-subtle bg-surface text-secondary shadow-sm transition hover:text-brand"
        aria-label="Cai dat"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Settings className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-card border border-subtle bg-surface shadow-popover">
          <div className="border-b border-soft px-4 py-3">
            <p className="text-sm font-semibold text-primary">Cai dat</p>
            <p className="mt-0.5 text-xs text-muted">
              Giao dien va tuy chon thong bao
            </p>
          </div>

          <div className="space-y-5 p-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-primary">Giao dien</p>
                <span className="text-xs font-medium text-muted">
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
                        "flex min-h-20 flex-col items-center justify-center gap-2 rounded-control border px-2 text-xs font-medium transition",
                        isSelected
                          ? "border-brand-soft bg-brand-soft text-brand-strong"
                          : "border-subtle bg-surface-soft text-secondary hover:border-brand hover:bg-surface",
                      )}
                      onClick={() => setTheme(option.value)}
                    >
                      <Icon className="size-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <p className="text-sm font-medium text-primary">
                  Thong bao
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  Dang luu local, san sang noi vao API thong bao sau nay.
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
                      className="flex w-full items-center justify-between gap-3 rounded-control border border-subtle bg-surface-soft px-3 py-2.5 text-left transition hover:bg-surface"
                      onClick={() => toggleNotification(option.key)}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-control bg-surface-muted text-secondary">
                          <Icon className="size-4" />
                        </span>
                        <span className="truncate text-sm font-medium text-secondary">
                          {option.label}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-pill border transition",
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
