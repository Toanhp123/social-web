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
import { cn } from "@/shared/lib/utils";

type FriendsTab = "friends" | "discover" | "incoming" | "outgoing";

export function FriendsOverview() {
  const t = useTranslations().friends;
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");

  const tabs: Array<{
    id: FriendsTab;
    label: string;
    icon: ReactNode;
    content: ReactNode;
  }> = [
    {
      id: "friends",
      label: t.title,
      icon: <Users className="size-4" />,
      content: <FriendsList />,
    },
    {
      id: "discover",
      label: t.discoverTitle,
      icon: <Search className="size-4" />,
      content: <FriendCandidateList />,
    },
    {
      id: "incoming",
      label: t.incomingTitle,
      icon: <Inbox className="size-4" />,
      content: <IncomingFriendRequestList />,
    },
    {
      id: "outgoing",
      label: t.outgoingTitle,
      icon: <Send className="size-4" />,
      content: <OutgoingFriendRequestList />,
    },
  ];
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card border">
      <div className="border-soft flex gap-1 overflow-x-auto border-b px-3 pt-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative inline-flex h-11 shrink-0 items-center gap-2 px-4 text-sm font-semibold transition",
                "text-secondary hover:bg-surface-soft hover:text-primary rounded-control",
                "focus-visible:ring-brand-ring focus-visible:ring-4 focus-visible:outline-none",
                isActive && "text-brand bg-brand-soft",
              )}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <span className="bg-brand rounded-pill absolute right-3 bottom-0 left-3 h-0.5" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">{activeTabContent}</div>
    </section>
  );
}
