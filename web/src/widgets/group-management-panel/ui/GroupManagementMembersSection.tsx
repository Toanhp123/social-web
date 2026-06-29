"use client";

import { Users } from "lucide-react";
import type { GroupMember, GroupMemberRole } from "@/entities/group";
import { GroupMemberManagementRow } from "./GroupMemberManagementRow";

type GroupManagementMembersSectionProps = {
  members: GroupMember[];
  viewerRole: GroupMemberRole | null;
  isLoading: boolean;
  isUpdating: (userId: string) => boolean;
  isRemoving: (userId: string) => boolean;
  onUpdateRole: (
    userId: string,
    role: Extract<GroupMemberRole, "ADMIN" | "MEMBER">,
  ) => void;
  onRemove: (userId: string) => void;
  t: Parameters<typeof GroupMemberManagementRow>[0]["t"] & {
    members: string;
    loadingMembers: string;
    noMembers: string;
  };
};

export function GroupManagementMembersSection({
  members,
  viewerRole,
  isLoading,
  isUpdating,
  isRemoving,
  onUpdateRole,
  onRemove,
  t,
}: GroupManagementMembersSectionProps) {
  return (
    <section className="rounded-card border-surface-border bg-surface border p-4">
      <h3 className="text-primary flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4" />
        {t.members}
      </h3>

      {isLoading ? (
        <p className="text-muted mt-3 text-sm">{t.loadingMembers}</p>
      ) : members.length === 0 ? (
        <p className="text-muted mt-3 text-sm">{t.noMembers}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {members.map((member) => (
            <GroupMemberManagementRow
              key={member.userId}
              member={member}
              viewerRole={viewerRole}
              onUpdateRole={(role) => onUpdateRole(member.userId, role)}
              onRemove={() => onRemove(member.userId)}
              isUpdating={isUpdating(member.userId)}
              isRemoving={isRemoving(member.userId)}
              t={t}
            />
          ))}
        </div>
      )}
    </section>
  );
}
