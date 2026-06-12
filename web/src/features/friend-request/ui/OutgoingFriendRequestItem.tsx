"use client";

import { FriendUserCard, type FriendRequest } from "@/entities/friend";
import { getProfileRoute } from "@/shared/config/routes";
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
      avatarAlt={t.avatarAlt}
      href={getProfileRoute(receiver.id)}
      variant="listItem"
      actionClassName="w-full sm:w-auto"
      action={
        <button
          type="button"
          onClick={() =>
            cancelMutation.mutate({
              requestId: request.id,
            })
          }
          disabled={cancelMutation.isPending}
          className="border-subtle text-secondary hover:border-danger-border hover:bg-danger-soft hover:text-danger focus-visible:ring-brand-ring rounded-control w-full border px-3 py-2 text-sm font-semibold transition focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
        >
          {cancelMutation.isPending ? t.canceling : t.cancel}
        </button>
      }
    />
  );
}
