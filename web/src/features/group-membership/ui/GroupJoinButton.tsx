"use client";

import { Lock, UserCheck, UserPlus } from "lucide-react";
import type { Group } from "@/entities/group";
import { Button } from "@/shared/ui";
import { useRequireAuthRedirect } from "@/shared/lib/use-require-auth-redirect";
import { useJoinGroupMutation } from "../model/use-join-group-mutation";

type GroupJoinButtonProps = {
  group: Group;
  canInteract?: boolean;
};

export function GroupJoinButton({
  group,
  canInteract = true,
}: GroupJoinButtonProps) {
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
        fullWidth={false}
        disabled
        className="inline-flex items-center justify-center gap-2"
      >
        <UserCheck className="size-4" />
        Joined
      </Button>
    );
  }

  if (isPendingRequest) {
    return (
      <Button
        type="button"
        variant="secondary"
        fullWidth={false}
        disabled
        className="inline-flex items-center justify-center gap-2"
      >
        <Lock className="size-4" />
        Pending
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        fullWidth={false}
        disabled={isPending}
        onClick={handleJoin}
        className="inline-flex items-center justify-center gap-2"
      >
        <UserPlus className="size-4" />
        {isPending ? "Joining..." : "Join group"}
      </Button>

      {joinMutation.error instanceof Error && (
        <p className="text-danger text-sm">{joinMutation.error.message}</p>
      )}
    </div>
  );
}
