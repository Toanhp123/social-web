"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { FriendUserCard } from "@/entities/friend";
import { getProfileRoute } from "@/shared/config/routes";
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
      <label className="border-soft bg-surface-soft text-muted focus-within:border-brand-border focus-within:ring-brand-ring rounded-control flex items-center gap-2 border px-3 py-2 text-sm transition focus-within:ring-4">
        <Search className="size-4 shrink-0" />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchPlaceholder}
          className="placeholder:text-placeholder text-primary min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>

      {candidatesQuery.isLoading ? (
        <div className="border-soft bg-surface text-muted rounded-card border p-4 text-sm">
          {t.loadingCandidates}
        </div>
      ) : candidatesQuery.isError ? (
        <div className="border-danger-border bg-danger-soft text-danger rounded-card border p-4 text-sm">
          {t.loadCandidatesError}
        </div>
      ) : candidates.length === 0 ? (
        <div className="border-soft bg-surface rounded-panel shadow-card border p-4 text-center sm:p-5">
          <p className="text-primary font-semibold">{t.emptyCandidates}</p>
          <p className="text-muted mt-1 text-sm">{t.emptyCandidatesHint}</p>
        </div>
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
                  <button
                    type="button"
                    onClick={() =>
                      sendFriendRequestMutation.mutate({
                        receiverId: candidate.id,
                        query,
                      })
                    }
                    disabled={sendFriendRequestMutation.isPending}
                    className="bg-brand text-inverse hover:bg-brand-hover focus-visible:ring-brand-ring rounded-control inline-flex h-9 w-full items-center justify-center gap-2 px-3 text-sm font-semibold transition focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    <UserPlus className="size-4 shrink-0" />
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
