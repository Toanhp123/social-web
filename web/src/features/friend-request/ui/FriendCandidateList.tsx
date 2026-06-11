"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { FriendUserCard } from "@/entities/friend";
import { useTranslations } from "@/shared/i18n";
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
      <label className="border-subtle bg-surface-muted text-muted rounded-control flex items-center gap-2 border px-3 py-2 text-sm">
        <Search className="size-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchPlaceholder}
          className="placeholder:text-muted min-w-0 flex-1 bg-transparent text-primary outline-none"
        />
      </label>

      {candidatesQuery.isLoading ? (
        <p className="text-muted text-sm">{t.loadingCandidates}</p>
      ) : candidatesQuery.isError ? (
        <p className="text-danger text-sm">{t.loadCandidatesError}</p>
      ) : candidates.length === 0 ? (
        <div className="border-subtle rounded-card border p-5 text-center">
          <p className="text-primary font-medium">{t.emptyCandidates}</p>
          <p className="text-muted mt-1 text-sm">{t.emptyCandidatesHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                action={
                  <button
                    type="button"
                    onClick={() =>
                      sendFriendRequestMutation.mutate({
                        receiverId: candidate.id,
                        query,
                      })
                    }
                    disabled={sendFriendRequestMutation.isPending}
                    className="bg-brand text-inverse hover:bg-brand-hover focus-visible:ring-brand-ring rounded-control inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    <UserPlus className="size-4" />
                    {isSending ? t.sending : t.addFriend}
                  </button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
