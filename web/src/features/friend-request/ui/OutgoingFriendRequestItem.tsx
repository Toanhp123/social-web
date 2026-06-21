"use client";

import { FriendUserCard, type FriendRequest } from "@/entities/friend";
import { getProfileRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";
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
        <Button
          type="button"
          size="sm"
          variant="danger"
          fullWidth={false}
          className="w-full sm:w-auto"
          onClick={() =>
            cancelMutation.mutate({
              requestId: request.id,
            })
          }
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? t.canceling : t.cancel}
        </Button>
      }
    />
  );
}
