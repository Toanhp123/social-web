"use client";

import { Globe2, Lock } from "lucide-react";
import type { Group } from "@/entities/group";
import { SelectableOptionGroup } from "@/shared/ui";

type GroupSettingsSectionProps = {
  group: Group;
  isUpdating: boolean;
  onPrivacyChange: (privacy: Group["privacy"]) => void;
  t: {
    settings: string;
    settingsDescription: string;
    privacy: string;
    public: string;
    publicDescription: string;
    private: string;
    privateDescription: string;
    updating: string;
  };
};

export function GroupSettingsSection({
  group,
  isUpdating,
  onPrivacyChange,
  t,
}: GroupSettingsSectionProps) {
  return (
    <section className="rounded-card border-surface-border bg-surface border p-4">
      <div className="mb-4">
        <h3 className="text-primary text-sm font-semibold">{t.settings}</h3>
        <p className="text-muted mt-1 text-sm">{t.settingsDescription}</p>
      </div>

      <div className="space-y-2">
        <p className="text-secondary text-xs font-semibold uppercase">
          {t.privacy}
        </p>
        <SelectableOptionGroup
          variant="row"
          options={[
            {
              value: "PUBLIC",
              label: t.public,
              meta: t.publicDescription,
              icon: <Globe2 className="size-4" />,
            },
            {
              value: "PRIVATE",
              label: t.private,
              meta: t.privateDescription,
              icon: <Lock className="size-4" />,
            },
          ]}
          selectedValues={[group.privacy]}
          onToggle={(value) => {
            if (!isUpdating && value !== group.privacy) {
              onPrivacyChange(value);
            }
          }}
        />
        {isUpdating && <p className="text-muted text-xs">{t.updating}</p>}
      </div>
    </section>
  );
}
