"use client";

import { useTranslations } from "@/shared/i18n";
import { FriendItem } from "./FriendItem";
import { useFriendsQuery } from "../model/use-friends-query";

export function FriendsList() {
  const friendsQuery = useFriendsQuery();
  const t = useTranslations().friends;

  if (friendsQuery.isLoading) {
    return <p className="text-muted text-sm">{t.loading}</p>;
  }

  if (friendsQuery.isError) {
    return <p className="text-danger text-sm">{t.loadError}</p>;
  }

  const friendships = friendsQuery.data ?? [];

  if (friendships.length === 0) {
    return (
      <div className="border-subtle bg-surface shadow-card rounded-card border p-8 text-center">
        <p className="text-primary font-medium">{t.emptyTitle}</p>

        <p className="text-muted mt-1 text-sm">{t.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friendships.map((friendship) => (
        <FriendItem key={friendship.user.id} friendship={friendship} />
      ))}
    </div>
  );
}
