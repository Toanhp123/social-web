"use client";

import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

export type ProfileTab = "posts" | "about";

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
};

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const t = useTranslations().profile;
  const tabs = [
    { value: "posts", label: t.posts },
    { value: "about", label: t.aboutTab },
  ] satisfies Array<{ value: ProfileTab; label: string }>;

  return (
    <nav className="text-secondary flex gap-1 overflow-x-auto py-1 text-sm font-semibold">
      {tabs.map((item) => {
        const isActive = item.value === activeTab;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onTabChange(item.value)}
            className={cn(
              "rounded-control hover:bg-surface-muted relative px-4 py-3 transition",
              isActive && "text-brand",
            )}
          >
            {item.label}

            {isActive && (
              <span className="rounded-pill bg-brand absolute inset-x-3 bottom-0 h-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
