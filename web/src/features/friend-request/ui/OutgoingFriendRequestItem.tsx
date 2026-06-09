"use client";

import { FriendRequest, FriendUserCard } from "@/entities/friend";
import { useTranslations } from "@/shared/i18n";
import { useCancelFriendRequestMutation } from "../model/use-cancel-friend-request-mutation";

type OutgoingFriendRequestItemProps = {
  request: FriendRequest;
};

export function OutgoingFriendRequestItem({
  request,
}: OutgoingFriendRequestItemProps) {
  const cancelMutation = useCancelFriendRequestMutation();
  const t = useTranslations().friendRequests;

  const receiver = request.receiver;

  return (
    <FriendUserCard
      avatarUrl={receiver.avatarUrl}
      fullName={receiver.fullName}
      username={receiver.username}
      avatarAlt={t.avatarAlt}
      action={
        <button
          type="button"
          onClick={() =>
            cancelMutation.mutate({
              requestId: request.id,
            })
          }
          disabled={cancelMutation.isPending}
          className="border-subtle text-secondary hover:border-danger-border hover:bg-danger-soft hover:text-danger focus-visible:ring-brand-ring rounded-control border px-3 py-1.5 text-sm font-medium transition focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {cancelMutation.isPending ? t.canceling : t.cancel}
        </button>
      }
    />
  );
}
