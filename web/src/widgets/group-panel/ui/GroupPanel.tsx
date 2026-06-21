"use client";

import { useState } from "react";
import type { Group } from "@/entities/group";
import { useCurrentSession } from "@/entities/session";
import { useGroupQuery } from "@/features/group-membership";
import { useTranslations } from "@/shared/i18n";
import { GroupManagementPanel } from "@/widgets/group-management-panel";
import { GroupDiscussion } from "./GroupDiscussion";
import { GroupHeader } from "./GroupHeader";
import {
  GroupAboutPanel,
  GroupMediaPreview,
  GroupMembersPreview,
} from "./GroupInfoPanels";
import { GroupTabs } from "./GroupTabs";
import type { GroupTab } from "./group-panel.types";

type GroupPanelProps = {
  group: Group;
};

export function GroupPanel({ group: initialGroup }: GroupPanelProps) {
  const t = useTranslations().groups;
  const { currentUser } = useCurrentSession();
  const groupQuery = useGroupQuery(initialGroup.id, initialGroup);
  const group = groupQuery.data ?? initialGroup;
  const isMember = Boolean(group.viewer.role);
  const canManage = group.viewer.role === "OWNER" || group.viewer.role === "ADMIN";
  const canInteract = Boolean(currentUser);
  const canViewFeed = group.privacy === "PUBLIC" || isMember;
  const [activeTab, setActiveTab] = useState<GroupTab>("discussion");

  return (
    <div className="space-y-4">
      <GroupHeader
        group={group}
        canInteract={canInteract}
        isMember={isMember}
        canManage={canManage}
        t={t}
      />

      <GroupTabs
        canManage={canManage}
        labels={t.detail.tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "discussion" && (
        <GroupDiscussion
          group={group}
          isMember={isMember}
          canInteract={canInteract}
          canViewFeed={canViewFeed}
          t={t}
        />
      )}

      {activeTab === "about" && <GroupAboutPanel group={group} t={t} />}

      {activeTab === "members" && <GroupMembersPreview group={group} t={t} />}

      {activeTab === "media" && <GroupMediaPreview t={t} />}

      {activeTab === "manage" && canManage && (
        <GroupManagementPanel group={group} />
      )}
    </div>
  );
}

export function GroupAboutRail({ group }: { group: Group }) {
  const t = useTranslations().groups;

  return (
    <div className="space-y-4">
      <GroupAboutPanel group={group} compact t={t} />
      <GroupMediaPreview compact t={t} />
      <GroupMembersPreview group={group} compact t={t} />
    </div>
  );
}
