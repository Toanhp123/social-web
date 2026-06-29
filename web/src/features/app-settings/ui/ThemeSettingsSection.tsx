import type { AppMessages } from "@/shared/i18n";
import { SelectableOptionGroup } from "@/shared/ui";
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

      <SelectableOptionGroup
        columns={3}
        selectedValues={[theme]}
        onToggle={onThemeChange}
        options={themeOptions.map((option) => {
          const Icon = option.icon;

          return {
            value: option.value,
            label: copy.themeOptions[option.value],
            icon: <Icon className="size-4" />,
          };
        })}
      />
    </section>
  );
}
