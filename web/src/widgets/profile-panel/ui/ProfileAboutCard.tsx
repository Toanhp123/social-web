"use client";

import type { UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import type { ProfileMetaItem } from "../model/types";

type ProfileAboutCardProps = {
  profile: UserProfile | null;
  metaItems: ProfileMetaItem[];
  compact?: boolean;
};

export function ProfileAboutCard({
  profile,
  metaItems,
  compact = false,
}: ProfileAboutCardProps) {
  const t = useTranslations().profile;

  return (
    <div className="border-surface-border rounded-card bg-surface p-4 shadow-card border">
      <h3 className="text-primary text-lg font-bold">{t.about}</h3>

      <p
        className={cn(
          "mt-3 text-sm leading-6",
          compact && "line-clamp-4",
          profile?.bio ? "text-secondary" : "text-placeholder",
        )}
      >
        {profile?.bio ?? t.noBio}
      </p>

      {metaItems.length > 0 && (
        <div className="mt-4 space-y-3">
          {metaItems.map((item) => {
            const Icon = item.icon;

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-3 text-sm text-secondary transition hover:text-brand"
                >
                  <Icon className="size-5 shrink-0 text-muted" />
                  <span className="truncate">{item.label}</span>
                </a>
              );
            }

            return (
              <div
                key={item.label}
                className="flex min-w-0 items-center gap-3 text-sm text-secondary"
              >
                <Icon className="size-5 shrink-0 text-muted" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {metaItems.length === 0 && (
        <p className="mt-3 text-sm text-placeholder">{t.emptyAbout}</p>
      )}
    </div>
  );
}

