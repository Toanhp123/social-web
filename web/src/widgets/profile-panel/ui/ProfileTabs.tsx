"use client";

import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

export function ProfileTabs() {
  const t = useTranslations().profile;
  const tabs = [t.posts, t.aboutTab, t.friendsTab, t.photos];

  return (
    <nav className="flex gap-1 overflow-x-auto py-1 text-sm font-semibold text-secondary">
      {tabs.map((item, index) => {
        const isActive = index === 0;

        return (
          <button
            key={item}
            type="button"
            className={cn(
              "relative rounded-lg px-4 py-3 transition hover:bg-surface-muted",
              isActive && "text-brand",
            )}
          >
            {item}

            {isActive && (
              <span className="absolute inset-x-3 bottom-0 h-1 rounded-pill bg-brand" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

