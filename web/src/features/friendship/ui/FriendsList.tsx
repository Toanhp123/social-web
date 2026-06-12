"use client";

import { useTranslations } from "@/shared/i18n";
import { FriendItem } from "./FriendItem";
import { useFriendsQuery } from "../model/use-friends-query";

export function FriendsList() {
  const friendsQuery = useFriendsQuery();
  const t = useTranslations().friends;

  if (friendsQuery.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-card border-surface-border bg-surface shadow-card flex min-h-48 animate-pulse flex-col items-center justify-between border p-4"
          >
            <div className="bg-surface-muted size-20 rounded-full" />
            <div className="bg-surface-muted rounded-pill h-4 w-3/4" />
            <div className="bg-surface-muted rounded-control h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (friendsQuery.isError) {
    return <p className="text-danger text-sm">{t.loadError}</p>;
  }

  const friendships = friendsQuery.data ?? [];

  if (friendships.length === 0) {
    return (
      <div className="border-subtle bg-surface shadow-card rounded-card border border-dashed p-10 text-center">
        <p className="text-primary font-medium">{t.emptyTitle}</p>

        <p className="text-muted mt-1 text-sm">{t.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {friendships.map((friendship) => (
        <FriendItem key={friendship.user.id} friendship={friendship} />
      ))}
    </div>
  );
}
