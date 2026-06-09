"use client";

import { FriendUserCard, type Friendship } from "@/entities/friend";
import { useTranslations } from "@/shared/i18n";
import { useRemoveFriendMutation } from "../model/use-remove-friend-mutation";

type FriendItemProps = {
  friendship: Friendship;
};

export function FriendItem({ friendship }: FriendItemProps) {
  const removeFriendMutation = useRemoveFriendMutation();
  const t = useTranslations().friends;

  const handleRemoveFriend = () => {
    removeFriendMutation.mutate({
      friendId: friendship.user.id,
    });
  };

  return (
    <FriendUserCard
      avatarUrl={friendship.user.avatarUrl}
      fullName={friendship.user.fullName}
      username={friendship.user.username}
      avatarAlt={t.avatarAlt}
      action={
        <button
          type="button"
          onClick={handleRemoveFriend}
          disabled={removeFriendMutation.isPending}
          className="border-subtle text-secondary hover:border-danger-border hover:bg-danger-soft hover:text-danger focus-visible:ring-brand-ring rounded-control shrink-0 border px-3 py-1.5 text-sm font-medium transition focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {removeFriendMutation.isPending ? t.removing : t.remove}
        </button>
      }
    />
  );
}
