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
    <nav
      className="border-subtle flex min-w-0 items-center gap-1 overflow-x-auto border-t"
      aria-label={t.profileInfo}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "relative h-12 shrink-0 px-4 text-sm font-semibold transition",
              isActive
                ? "text-brand"
                : "text-secondary hover:bg-surface-muted hover:text-primary",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive && (
              <span className="bg-brand absolute inset-x-3 bottom-0 h-0.5 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
