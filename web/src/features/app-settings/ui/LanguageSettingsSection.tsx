import type { AppLanguage, AppMessages } from "@/shared/i18n";
import { SelectableOptionGroup } from "@/shared/ui";
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

      <SelectableOptionGroup
        columns={2}
        selectedValues={[language]}
        onToggle={onLanguageChange}
        options={languageOptions.map((option) => {
          const Icon = option.icon;

          return {
            value: option.value,
            label: copy.languageOptions[option.value],
            meta: option.label,
            icon: <Icon className="size-4" />,
          };
        })}
      />
    </section>
  );
}
