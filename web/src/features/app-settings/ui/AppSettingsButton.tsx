"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { useI18n, useTranslations } from "@/shared/i18n";
import {
  applyFontSize,
  applyTheme,
  persistFontSize,
  persistNotificationSettings,
  persistTheme,
  readStoredFontSize,
  readStoredNotificationSettings,
  readStoredTheme,
} from "../lib/app-settings-storage";
import type {
  AppFontSize,
  AppTheme,
  NotificationSettings,
} from "../model/app-settings";
import { AppSettingsPopover } from "./AppSettingsPopover";

export function AppSettingsButton() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { language, setLanguage } = useI18n();
  const copy = useTranslations().settings;

  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => readStoredTheme());
  const [fontSize, setFontSize] = useState<AppFontSize>(() =>
    readStoredFontSize(),
  );
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(() => readStoredNotificationSettings());

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    applyFontSize(fontSize);
    persistFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    persistNotificationSettings(notificationSettings);
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
        <AppSettingsPopover
          copy={copy}
          theme={theme}
          fontSize={fontSize}
          language={language}
          notificationSettings={notificationSettings}
          onThemeChange={setTheme}
          onFontSizeChange={setFontSize}
          onLanguageChange={setLanguage}
          onNotificationToggle={toggleNotification}
        />
      )}
    </div>
  );
}
