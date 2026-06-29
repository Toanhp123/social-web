"use client";

import { FriendUserCard, type FriendRequest } from "@/entities/friend";
import { getProfileRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useAcceptFriendRequestMutation } from "../model/use-accept-friend-request-mutation";
import { useRejectFriendRequestMutation } from "../model/use-reject-friend-request-mutation";

type IncomingFriendRequestItemProps = {
  request: FriendRequest;
};

export function IncomingFriendRequestItem({
  request,
}: IncomingFriendRequestItemProps) {
  const acceptMutation = useAcceptFriendRequestMutation();
  const rejectMutation = useRejectFriendRequestMutation();
  const t = useTranslations().friendRequests;

  const requester = request.requester;
  const isPending = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <FriendUserCard
      avatarUrl={requester.avatarUrl}
      fullName={requester.fullName}
      avatarAlt={t.avatarAlt}
      href={getProfileRoute(requester.id)}
      variant="listItem"
      actionClassName="w-full sm:w-auto"
      action={
        <div className="grid gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            size="sm"
            fullWidth={false}
            className="w-full sm:w-auto"
            onClick={() =>
              acceptMutation.mutate({
                requestId: request.id,
              })
            }
            disabled={isPending}
          >
            {acceptMutation.isPending ? t.accepting : t.accept}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="danger"
            fullWidth={false}
            className="w-full sm:w-auto"
            onClick={() =>
              rejectMutation.mutate({
                requestId: request.id,
              })
            }
            disabled={isPending}
          >
            {rejectMutation.isPending ? t.declining : t.decline}
          </Button>
        </div>
      }
    />
  );
}
