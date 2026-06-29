"use client";

import { ShieldCheck } from "lucide-react";
import type { Group } from "@/entities/group";
import { useTranslations } from "@/shared/i18n";
import { Card } from "@/shared/ui";
import {
  useApproveGroupJoinRequestMutation,
  useGroupJoinRequestsQuery,
  useGroupMembersQuery,
  useRejectGroupJoinRequestMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMemberRoleMutation,
  useUpdateGroupPrivacyMutation,
} from "@/features/group-membership";
import { GroupJoinRequestsSection } from "./GroupJoinRequestsSection";
import { GroupManagementMembersSection } from "./GroupManagementMembersSection";
import { GroupSettingsSection } from "./GroupSettingsSection";

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
  const updatePrivacyMutation = useUpdateGroupPrivacyMutation();
  const removeMemberMutation = useRemoveGroupMemberMutation();

  if (!canManage) {
    return null;
  }

  const error =
    membersQuery.error ??
    requestsQuery.error ??
    approveMutation.error ??
    rejectMutation.error ??
    updateRoleMutation.error ??
    updatePrivacyMutation.error ??
    removeMemberMutation.error;

  return (
    <Card variant="elevated" className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-primary text-base font-semibold">{t.title}</h2>
          <p className="text-muted mt-1 text-sm">{t.description}</p>
        </div>

        <ShieldCheck className="text-brand size-5" />
      </header>

      {error instanceof Error && (
        <p className="rounded-card bg-danger-soft text-danger px-3 py-2 text-sm">
          {error.message}
        </p>
      )}

      <GroupSettingsSection
        group={group}
        isUpdating={updatePrivacyMutation.isPending}
        onPrivacyChange={(privacy) =>
          updatePrivacyMutation.mutate({ groupId: group.id, privacy })
        }
        t={t}
      />

      <GroupJoinRequestsSection
        requests={requestsQuery.data ?? []}
        isLoading={requestsQuery.isLoading}
        isApprovePending={(requestId) =>
          approveMutation.isPending &&
          approveMutation.variables?.requestId === requestId
        }
        isRejectPending={(requestId) =>
          rejectMutation.isPending &&
          rejectMutation.variables?.requestId === requestId
        }
        onApprove={(requestId) =>
          approveMutation.mutate({ groupId: group.id, requestId })
        }
        onReject={(requestId) =>
          rejectMutation.mutate({ groupId: group.id, requestId })
        }
        t={t}
      />

      <GroupManagementMembersSection
        members={membersQuery.data ?? []}
        viewerRole={viewerRole}
        isLoading={membersQuery.isLoading}
        isUpdating={(userId) =>
          updateRoleMutation.isPending &&
          updateRoleMutation.variables?.userId === userId
        }
        isRemoving={(userId) =>
          removeMemberMutation.isPending &&
          removeMemberMutation.variables?.userId === userId
        }
        onUpdateRole={(userId, role) =>
          updateRoleMutation.mutate({ groupId: group.id, userId, role })
        }
        onRemove={(userId) =>
          removeMemberMutation.mutate({ groupId: group.id, userId })
        }
        t={t}
      />
    </Card>
  );
}
