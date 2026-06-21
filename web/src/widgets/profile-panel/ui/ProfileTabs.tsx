"use client";

import { useTranslations } from "@/shared/i18n";
import { SegmentedTabs } from "@/shared/ui";

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
    <SegmentedTabs
      items={tabs}
      value={activeTab}
      onValueChange={onTabChange}
      ariaLabel={t.profileInfo}
      className="py-1"
    />
  );
}
