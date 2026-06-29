import type { AppMessages } from "@/shared/i18n";
import { SelectableOptionGroup } from "@/shared/ui";
import type { NotificationSettings } from "../model/app-settings";
import { notificationOptions } from "../model/app-settings-options";

type NotificationSettingsSectionProps = {
  copy: AppMessages["settings"];
  notificationSettings: NotificationSettings;
  onNotificationToggle: (key: keyof NotificationSettings) => void;
};

export function NotificationSettingsSection({
  copy,
  notificationSettings,
  onNotificationToggle,
}: NotificationSettingsSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-primary text-sm font-medium">{copy.notifications}</p>
        <p className="text-muted mt-0.5 text-xs leading-5">
          {copy.notificationsDescription}
        </p>
      </div>

      <SelectableOptionGroup
        variant="row"
        selectedValues={notificationOptions
          .filter((option) => notificationSettings[option.key])
          .map((option) => option.key)}
        onToggle={onNotificationToggle}
        options={notificationOptions.map((option) => {
          const Icon = option.icon;

          return {
            value: option.key,
            label: copy.notificationOptions[option.key],
            icon: <Icon className="size-4" />,
          };
        })}
      />
    </section>
  );
}
