import { Check } from "lucide-react";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
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

      <div className="space-y-2">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = notificationSettings[option.key];

          return (
            <button
              key={option.key}
              type="button"
              className="rounded-control border-subtle bg-surface-soft hover:bg-surface flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition"
              onClick={() => onNotificationToggle(option.key)}
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
  );
}
