import type {
  AppFontSize,
  AppTheme,
  NotificationSettings,
} from "../model/app-settings";
import type { AppLanguage, AppMessages } from "@/shared/i18n";
import { FontSizeSettingsSection } from "./FontSizeSettingsSection";
import { LanguageSettingsSection } from "./LanguageSettingsSection";
import { NotificationSettingsSection } from "./NotificationSettingsSection";
import { ThemeSettingsSection } from "./ThemeSettingsSection";
import { cn } from "@/shared/lib/utils";

type AppSettingsPopoverProps = {
  copy: AppMessages["settings"];
  theme: AppTheme;
  fontSize: AppFontSize;
  language: AppLanguage;
  notificationSettings: NotificationSettings;
  onThemeChange: (theme: AppTheme) => void;
  onFontSizeChange: (fontSize: AppFontSize) => void;
  onLanguageChange: (language: AppLanguage) => void;
  onNotificationToggle: (key: keyof NotificationSettings) => void;
};

export function AppSettingsPopover({
  copy,
  theme,
  fontSize,
  language,
  notificationSettings,
  onThemeChange,
  onFontSizeChange,
  onLanguageChange,
  onNotificationToggle,
}: AppSettingsPopoverProps) {
  return (
    <div
      className={cn(
        "rounded-card border-subtle bg-surface shadow-popover z-40 overflow-hidden border",
        "fixed inset-x-3 top-18 max-h-[calc(100dvh-5.5rem)] w-auto overflow-y-auto",
        "sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:max-h-none sm:w-88 sm:overflow-hidden",
      )}
    >
      <div className="border-soft border-b px-4 py-3">
        <p className="text-primary text-sm font-semibold">{copy.settings}</p>
        <p className="text-muted mt-0.5 text-xs">{copy.description}</p>
      </div>

      <div className="space-y-5 p-4">
        <ThemeSettingsSection
          copy={copy}
          theme={theme}
          onThemeChange={onThemeChange}
        />

        <FontSizeSettingsSection
          copy={copy}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
        />

        <LanguageSettingsSection
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
        />

        <NotificationSettingsSection
          copy={copy}
          notificationSettings={notificationSettings}
          onNotificationToggle={onNotificationToggle}
        />
      </div>
    </div>
  );
}
