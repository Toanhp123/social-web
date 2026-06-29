"use client";

import { Inbox, Search, Send, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  FriendCandidateList,
  IncomingFriendRequestList,
  OutgoingFriendRequestList,
} from "@/features/friend-request";
import { FriendsList } from "@/features/friendship";
import { useTranslations } from "@/shared/i18n";
import { Card, SegmentedTabs } from "@/shared/ui";

type FriendsTab = "friends" | "discover" | "incoming" | "outgoing";

export function FriendsOverview() {
  const t = useTranslations().friends;
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");

  const tabs: Array<{
    value: FriendsTab;
    label: string;
    icon: ReactNode;
    content: ReactNode;
  }> = [
    {
      value: "friends",
      label: t.title,
      icon: <Users className="size-4" />,
      content: <FriendsList />,
    },
    {
      value: "discover",
      label: t.discoverTitle,
      icon: <Search className="size-4" />,
      content: <FriendCandidateList />,
    },
    {
      value: "incoming",
      label: t.incomingTitle,
      icon: <Inbox className="size-4" />,
      content: <IncomingFriendRequestList />,
    },
    {
      value: "outgoing",
      label: t.outgoingTitle,
      icon: <Send className="size-4" />,
      content: <OutgoingFriendRequestList />,
    },
  ];
  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <Card padding="none">
      <div className="border-soft border-b px-2 pt-2 sm:px-3 sm:pt-3">
        <SegmentedTabs
          items={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          ariaLabel={t.title}
          hideLabelBelowSm
        />
      </div>

      <div className="p-3 sm:p-5">{activeTabContent}</div>
    </Card>
  );
}
