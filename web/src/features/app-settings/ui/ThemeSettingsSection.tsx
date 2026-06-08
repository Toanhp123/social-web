import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import type { AppTheme } from "../model/app-settings";
import { themeOptions } from "../model/app-settings-options";

type ThemeSettingsSectionProps = {
  copy: AppMessages["settings"];
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
};

export function ThemeSettingsSection({
  copy,
  theme,
  onThemeChange,
}: ThemeSettingsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-primary text-sm font-medium">{copy.theme}</p>
        <span className="text-muted text-xs font-medium">
          {copy.themeOptions[theme]}
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
              onClick={() => onThemeChange(option.value)}
            >
              <Icon className="size-4" />
              {copy.themeOptions[option.value]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
