"use client";

import { useTranslations } from "@/shared/i18n";
import { OutgoingFriendRequestItem } from "./OutgoingFriendRequestItem";
import { useOutgoingFriendRequestsQuery } from "../model/use-outgoing-friend-requests-query";

export function OutgoingFriendRequestList() {
  const t = useTranslations().friendRequests;
  const outgoingRequestsQuery = useOutgoingFriendRequestsQuery();

  if (outgoingRequestsQuery.isLoading) {
    return (
      <div className="border-soft bg-surface text-muted rounded-card border p-4 text-sm">
        {t.loadingOutgoing}
      </div>
    );
  }

  if (outgoingRequestsQuery.isError) {
    return (
      <div className="border-danger-border bg-danger-soft text-danger rounded-card border p-4 text-sm">
        {t.loadError}
      </div>
    );
  }

  const requests = outgoingRequestsQuery.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="border-soft bg-surface rounded-panel shadow-card border p-4 text-center sm:p-6">
        <p className="text-primary font-semibold">{t.emptyOutgoing}</p>

        <p className="text-muted mt-1 text-sm">{t.emptyOutgoingHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <OutgoingFriendRequestItem key={request.id} request={request} />
      ))}
    </div>
  );
}
