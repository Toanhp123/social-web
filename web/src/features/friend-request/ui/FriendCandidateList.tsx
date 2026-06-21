"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { FriendUserCard } from "@/entities/friend";
import { getProfileRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Button, EmptyState, SearchField } from "@/shared/ui";
import { useFriendCandidatesQuery } from "../model/use-friend-candidates-query";
import { useSendFriendRequestMutation } from "../model/use-send-friend-request-mutation";

export function FriendCandidateList() {
  const t = useTranslations().friendRequests;
  const [query, setQuery] = useState("");
  const candidatesQuery = useFriendCandidatesQuery(query);
  const sendFriendRequestMutation = useSendFriendRequestMutation();
  const candidates = candidatesQuery.data ?? [];

  return (
    <div className="space-y-3">
      <SearchField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t.searchPlaceholder}
      />

      {candidatesQuery.isLoading ? (
        <div className="border-soft bg-surface text-muted rounded-card border p-4 text-sm">
          {t.loadingCandidates}
        </div>
      ) : candidatesQuery.isError ? (
        <div className="border-danger-border bg-danger-soft text-danger rounded-card border p-4 text-sm">
          {t.loadCandidatesError}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          title={t.emptyCandidates}
          description={t.emptyCandidatesHint}
          className="grid min-h-32 place-items-center text-center"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {candidates.map((candidate) => {
            const isSending =
              sendFriendRequestMutation.isPending &&
              sendFriendRequestMutation.variables?.receiverId === candidate.id;

            return (
              <FriendUserCard
                key={candidate.id}
                avatarUrl={candidate.avatarUrl}
                fullName={candidate.fullName}
                username={candidate.username}
                avatarAlt={t.avatarAlt}
                href={getProfileRoute(candidate.id)}
                actionClassName="mt-auto"
                action={
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      sendFriendRequestMutation.mutate({
                        receiverId: candidate.id,
                        query,
                      })
                    }
                    disabled={sendFriendRequestMutation.isPending}
                  >
                    <UserPlus className="size-4 shrink-0" />
                    {isSending ? t.sending : t.addFriend}
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
