import type { AppLanguage, AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { languageOptions } from "../model/app-settings-options";

type LanguageSettingsSectionProps = {
  copy: AppMessages["settings"];
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
};

export function LanguageSettingsSection({
  copy,
  language,
  onLanguageChange,
}: LanguageSettingsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-primary text-sm font-medium">{copy.language}</p>
        <span className="text-muted text-xs font-medium">
          {copy.languageOptions[language]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {languageOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = language === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-control flex min-h-14 items-center justify-center gap-2 border px-3 text-sm font-medium transition",
                isSelected
                  ? "border-brand-border bg-brand-soft text-brand-strong"
                  : "border-subtle bg-surface-soft text-secondary hover:border-brand hover:bg-surface",
              )}
              onClick={() => onLanguageChange(option.value)}
            >
              <Icon className="size-4" />
              <span>{copy.languageOptions[option.value]}</span>
              <span className="text-muted text-xs">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
