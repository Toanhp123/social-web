"use client";

import { ShieldCheck, UserMinus, UserPlus, Users } from "lucide-react";
import type { Group, GroupMember, GroupMemberRole } from "@/entities/group";
import { useTranslations } from "@/shared/i18n";
import { Avatar, Button, Card, Combobox } from "@/shared/ui";
import {
  useApproveGroupJoinRequestMutation,
  useGroupJoinRequestsQuery,
  useGroupMembersQuery,
  useRejectGroupJoinRequestMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMemberRoleMutation,
} from "@/features/group-membership";

type GroupManagementPanelProps = {
  group: Group;
};

export function GroupManagementPanel({ group }: GroupManagementPanelProps) {
  const t = useTranslations().groups.detail.management;
  const viewerRole = group.viewer.role;
  const canManage = viewerRole === "OWNER" || viewerRole === "ADMIN";
  const membersQuery = useGroupMembersQuery(group.id, canManage);
  const requestsQuery = useGroupJoinRequestsQuery(group.id, canManage);
  const approveMutation = useApproveGroupJoinRequestMutation();
  const rejectMutation = useRejectGroupJoinRequestMutation();
  const updateRoleMutation = useUpdateGroupMemberRoleMutation();
  const removeMemberMutation = useRemoveGroupMemberMutation();

  if (!canManage) {
    return null;
  }

  const members = membersQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const error =
    membersQuery.error ??
    requestsQuery.error ??
    approveMutation.error ??
    rejectMutation.error ??
    updateRoleMutation.error ??
    removeMemberMutation.error;

  return (
    <Card variant="elevated" className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-primary text-base font-semibold">
            {t.title}
          </h2>
          <p className="text-muted mt-1 text-sm">
            {t.description}
          </p>
        </div>

        <ShieldCheck className="text-brand size-5" />
      </header>

      {error instanceof Error && (
        <p className="rounded-card bg-danger-soft text-danger px-3 py-2 text-sm">
          {error.message}
        </p>
      )}

      <div className="space-y-3">
        <h3 className="text-primary flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="size-4" />
          {t.joinRequests}
        </h3>

        {requestsQuery.isLoading ? (
          <p className="text-muted text-sm">{t.loadingRequests}</p>
        ) : requests.length === 0 ? (
          <p className="text-muted text-sm">{t.noPendingRequests}</p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => {
              const requester = request.requester;
              const isReviewing =
                (approveMutation.isPending &&
                  approveMutation.variables?.requestId === request.id) ||
                (rejectMutation.isPending &&
                  rejectMutation.variables?.requestId === request.id);

              return (
                <div
                  key={request.id}
                  className="border-soft flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <Avatar
                    src={requester?.avatarUrl}
                    name={requester?.fullName ?? request.requesterId}
                    alt={requester?.fullName ?? t.requesterFallback}
                    size={40}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-primary truncate text-sm font-medium">
                      {requester?.fullName ?? request.requesterId}
                    </p>
                    {requester?.username && (
                      <p className="text-muted truncate text-xs">
                        @{requester.username}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      size="xs"
                      fullWidth={false}
                      disabled={isReviewing}
                      onClick={() =>
                        approveMutation.mutate({
                          groupId: group.id,
                          requestId: request.id,
                        })
                      }
                    >
                      {t.accept}
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="secondary"
                      fullWidth={false}
                      disabled={isReviewing}
                      onClick={() =>
                        rejectMutation.mutate({
                          groupId: group.id,
                          requestId: request.id,
                        })
                      }
                    >
                      {t.decline}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-primary flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4" />
          {t.members}
        </h3>

        {membersQuery.isLoading ? (
          <p className="text-muted text-sm">{t.loadingMembers}</p>
        ) : members.length === 0 ? (
          <p className="text-muted text-sm">{t.noMembers}</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <GroupMemberRow
                key={member.userId}
                member={member}
                viewerRole={viewerRole}
                onUpdateRole={(role) =>
                  updateRoleMutation.mutate({
                    groupId: group.id,
                    userId: member.userId,
                    role,
                  })
                }
                onRemove={() =>
                  removeMemberMutation.mutate({
                    groupId: group.id,
                    userId: member.userId,
                  })
                }
                isUpdating={
                  updateRoleMutation.isPending &&
                  updateRoleMutation.variables?.userId === member.userId
                }
                isRemoving={
                  removeMemberMutation.isPending &&
                  removeMemberMutation.variables?.userId === member.userId
                }
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

type GroupMemberRowProps = {
  member: GroupMember;
  viewerRole: GroupMemberRole | null;
  onUpdateRole: (role: Extract<GroupMemberRole, "ADMIN" | "MEMBER">) => void;
  onRemove: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
  t: ReturnType<typeof useTranslations>["groups"]["detail"]["management"];
};

function GroupMemberRow({
  member,
  viewerRole,
  onUpdateRole,
  onRemove,
  isUpdating,
  isRemoving,
  t,
}: GroupMemberRowProps) {
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
            {member.user.username ? `@${member.user.username}` : getRoleLabel(member.role, t)}
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

function getRoleLabel(
  role: GroupMemberRole,
  t: ReturnType<typeof useTranslations>["groups"]["detail"]["management"],
) {
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
