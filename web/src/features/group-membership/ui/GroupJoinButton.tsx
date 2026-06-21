"use client";

import { Lock, UserCheck, UserPlus } from "lucide-react";
import type { Group } from "@/entities/group";
import { useTranslations } from "@/shared/i18n";
import { useRequireAuthRedirect } from "@/shared/lib/use-require-auth-redirect";
import { Button } from "@/shared/ui";
import { useJoinGroupMutation } from "../model/use-join-group-mutation";

type GroupJoinButtonProps = {
  group: Group;
  canInteract?: boolean;
  fullWidth?: boolean;
};

export function GroupJoinButton({
  group,
  canInteract = true,
  fullWidth = false,
}: GroupJoinButtonProps) {
  const t = useTranslations().groups;
  const requireAuth = useRequireAuthRedirect();
  const joinMutation = useJoinGroupMutation();
  const role = group.viewer.role;
  const isPendingRequest = group.viewer.joinRequestStatus === "PENDING";
  const isPending = joinMutation.isPending;

  function handleJoin() {
    if (!canInteract) {
      requireAuth();
      return;
    }

    joinMutation.mutate({ groupId: group.id });
  }

  if (role) {
    return (
      <Button
        type="button"
        variant="secondary"
        fullWidth={fullWidth}
        disabled
        className="inline-flex items-center justify-center gap-2"
      >
        <UserCheck className="size-4" />
        {t.joined}
      </Button>
    );
  }

  if (isPendingRequest) {
    return (
      <Button
        type="button"
        variant="secondary"
        fullWidth={fullWidth}
        disabled
        className="inline-flex items-center justify-center gap-2"
      >
        <Lock className="size-4" />
        {t.pending}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        fullWidth={fullWidth}
        disabled={isPending}
        onClick={handleJoin}
        className="inline-flex items-center justify-center gap-2"
      >
        <UserPlus className="size-4" />
        {isPending ? t.joining : t.joinGroup}
      </Button>

      {joinMutation.error instanceof Error && (
        <p className="text-danger text-sm">{joinMutation.error.message}</p>
      )}
    </div>
  );
}
