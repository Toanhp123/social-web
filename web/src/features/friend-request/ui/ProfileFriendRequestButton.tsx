"use client";

import { Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useSendFriendRequestMutation } from "../model/use-send-friend-request-mutation";

type ProfileFriendRequestButtonProps = {
  receiverId: string;
};

export function ProfileFriendRequestButton({
  receiverId,
}: ProfileFriendRequestButtonProps) {
  const t = useTranslations().friendRequests;
  const [isSent, setIsSent] = useState(false);
  const sendFriendRequestMutation = useSendFriendRequestMutation();

  const handleSendRequest = () => {
    sendFriendRequestMutation.mutate(
      { receiverId },
      {
        onSuccess: () => setIsSent(true),
      },
    );
  };

  const isDisabled = isSent || sendFriendRequestMutation.isPending;
  const Icon = isSent ? Check : UserPlus;

  return (
    <div className="min-w-40">
      <Button
        type="button"
        fullWidth={false}
        onClick={handleSendRequest}
        disabled={isDisabled}
        className="inline-flex items-center gap-2"
      >
        <Icon className="size-4" />
        {sendFriendRequestMutation.isPending
          ? t.sending
          : isSent
            ? t.sent
            : t.addFriend}
      </Button>

      {sendFriendRequestMutation.isError && (
        <p className="text-danger mt-1 text-xs">
          {sendFriendRequestMutation.error.message}
        </p>
      )}
    </div>
  );
}
