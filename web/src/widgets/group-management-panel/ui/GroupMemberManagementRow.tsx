"use client";

import { UserMinus } from "lucide-react";
import type { GroupMember, GroupMemberRole } from "@/entities/group";
import { useTranslations } from "@/shared/i18n";
import { Avatar, Button, Combobox } from "@/shared/ui";

type ManagementMessages = ReturnType<
  typeof useTranslations
>["groups"]["detail"]["management"];

type GroupMemberManagementRowProps = {
  member: GroupMember;
  viewerRole: GroupMemberRole | null;
  onUpdateRole: (role: Extract<GroupMemberRole, "ADMIN" | "MEMBER">) => void;
  onRemove: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
  t: ManagementMessages;
};

export function GroupMemberManagementRow({
  member,
  viewerRole,
  onUpdateRole,
  onRemove,
  isUpdating,
  isRemoving,
  t,
}: GroupMemberManagementRowProps) {
  const canEditRole = canChangeRole(viewerRole, member.role);
  const canRemove = canRemoveMember(viewerRole, member.role);
  const roleOptions = [
    { value: "OWNER", label: t.roles.owner },
    { value: "ADMIN", label: t.roles.admin },
    { value: "MEMBER", label: t.roles.member },
  ];

  return (
    <div className="border-soft flex flex-col gap-3 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar
          src={member.user.avatarUrl}
          name={member.user.fullName}
          alt={member.user.fullName}
          size={40}
        />

        <div className="min-w-0">
          <p className="text-primary truncate text-sm font-medium">
            {member.user.fullName}
          </p>
          <p className="text-muted truncate text-xs">
            {member.user.username
              ? `@${member.user.username}`
              : getRoleLabel(member.role, t)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Combobox
          name={`group-member-role-${member.userId}`}
          options={roleOptions}
          size="xs"
          value={member.role}
          disabled={!canEditRole || isUpdating}
          onValueChange={(nextRole) => {
            if (nextRole === "ADMIN" || nextRole === "MEMBER") {
              onUpdateRole(nextRole);
            }
          }}
        />

        <Button
          type="button"
          size="icon"
          variant="danger"
          fullWidth={false}
          disabled={!canRemove || isRemoving}
          aria-label={t.removeMember.replace("{name}", member.user.fullName)}
          onClick={onRemove}
          className="grid size-9 place-items-center"
        >
          <UserMinus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function getRoleLabel(role: GroupMemberRole, t: ManagementMessages) {
  if (role === "OWNER") return t.roles.owner;
  if (role === "ADMIN") return t.roles.admin;

  return t.roles.member;
}

function canChangeRole(
  viewerRole: GroupMemberRole | null,
  targetRole: GroupMemberRole,
): boolean {
  if (targetRole === "OWNER") {
    return false;
  }

  if (viewerRole === "OWNER") {
    return true;
  }

  return viewerRole === "ADMIN" && targetRole === "MEMBER";
}

function canRemoveMember(
  viewerRole: GroupMemberRole | null,
  targetRole: GroupMemberRole,
): boolean {
  if (targetRole === "OWNER") {
    return false;
  }

  if (viewerRole === "OWNER") {
    return true;
  }

  return viewerRole === "ADMIN" && targetRole === "MEMBER";
}
