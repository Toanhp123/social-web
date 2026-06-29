import {
  ImageIcon,
  Info,
  MessageSquareText,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SegmentedTabs } from "@/shared/ui";
import type { GroupMessages, GroupTab } from "./group-panel.types";

type GroupTabsProps = {
  canManage: boolean;
  labels: GroupMessages["detail"]["tabs"];
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
};

export function GroupTabs({
  canManage,
  labels,
  activeTab,
  onTabChange,
}: GroupTabsProps) {
  const tabs = getGroupTabs(canManage, labels);

  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card border">
      <SegmentedTabs
        items={tabs.map((tab) => {
          const Icon = tab.icon;

          return {
            value: tab.id,
            label: tab.label,
            icon: <Icon className="size-4" />,
          };
        })}
        value={activeTab}
        onValueChange={onTabChange}
        ariaLabel="Group"
        className="px-2 pt-2"
      />
    </section>
  );
}

function getGroupTabs(
  canManage: boolean,
  labels: GroupMessages["detail"]["tabs"],
) {
  const tabs: Array<{ id: GroupTab; label: string; icon: LucideIcon }> = [
    { id: "discussion", label: labels.discussion, icon: MessageSquareText },
    { id: "about", label: labels.about, icon: Info },
    { id: "members", label: labels.members, icon: Users },
    { id: "media", label: labels.media, icon: ImageIcon },
  ];

  if (canManage) {
    tabs.push({ id: "manage", label: labels.manage, icon: ShieldCheck });
  }

  return tabs;
}
