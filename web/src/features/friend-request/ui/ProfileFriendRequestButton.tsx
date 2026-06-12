"use client";

import { Check, Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useProfileFriendshipStatus } from "../model/use-profile-friendship-status";
import { useSendFriendRequestMutation } from "../model/use-send-friend-request-mutation";

type ProfileFriendRequestButtonProps = {
  receiverId: string;
};

export function ProfileFriendRequestButton({
  receiverId,
}: ProfileFriendRequestButtonProps) {
  const t = useTranslations().friendRequests;
  const friendshipStatus = useProfileFriendshipStatus(receiverId);
  const sendFriendRequestMutation = useSendFriendRequestMutation();

  const handleSendRequest = () => {
    sendFriendRequestMutation.mutate({ receiverId });
  };

  const isSent = Boolean(friendshipStatus.outgoingRequest);
  const isReceived = Boolean(friendshipStatus.incomingRequest);
  const isFriend = friendshipStatus.isFriend;
  const isPending =
    friendshipStatus.isLoading || sendFriendRequestMutation.isPending;
  const isDisabled = isFriend || isSent || isReceived || isPending;
  const Icon = isPending
    ? Loader2
    : isFriend || isSent || isReceived
      ? Check
      : UserPlus;
  const error = friendshipStatus.error ?? sendFriendRequestMutation.error;

  return (
    <div>
      <Button
        type="button"
        fullWidth={false}
        variant={isFriend || isSent || isReceived ? "secondary" : "primary"}
        onClick={handleSendRequest}
        disabled={isDisabled}
        className="inline-flex items-center gap-2"
      >
        <Icon className={isPending ? "size-4 animate-spin" : "size-4"} />
        {isPending
          ? t.sending
          : isFriend
            ? t.alreadyFriends
            : isReceived
              ? t.requestReceived
              : isSent
                ? t.sent
                : t.addFriend}
      </Button>

      {error && <p className="text-danger mt-1 text-xs">{error.message}</p>}
    </div>
  );
}
