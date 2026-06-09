"use client";

import { FriendRequest, FriendUserCard } from "@/entities/friend";
import { useTranslations } from "@/shared/i18n";
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
      username={requester.username}
      avatarAlt={t.avatarAlt}
      action={
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() =>
              acceptMutation.mutate({
                requestId: request.id,
              })
            }
            disabled={isPending}
            className="bg-brand text-inverse hover:bg-brand-hover rounded-control px-3 py-1.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50"
          >
            {acceptMutation.isPending ? t.accepting : t.accept}
          </button>

          <button
            type="button"
            onClick={() =>
              rejectMutation.mutate({
                requestId: request.id,
              })
            }
            disabled={isPending}
            className="border-subtle text-secondary hover:border-danger-border hover:bg-danger-soft hover:text-danger rounded-control border px-3 py-1.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50"
          >
            {rejectMutation.isPending ? t.declining : t.decline}
          </button>
        </div>
      }
    />
  );
}
