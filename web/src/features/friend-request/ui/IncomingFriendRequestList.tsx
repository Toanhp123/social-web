"use client";

import { useTranslations } from "@/shared/i18n";
import { IncomingFriendRequestItem } from "./IncomingFriendRequestItem";
import { useIncomingFriendRequestsQuery } from "../model/use-incoming-friend-requests-query";

export function IncomingFriendRequestList() {
  const t = useTranslations().friendRequests;
  const incomingRequestsQuery = useIncomingFriendRequestsQuery();
  if (incomingRequestsQuery.isLoading) {
    return (
      <div className="border-soft bg-surface text-muted rounded-card border p-4 text-sm">
        {t.loadingIncoming}
      </div>
    );
  }

  if (incomingRequestsQuery.isError) {
    return (
      <div className="border-danger-border bg-danger-soft text-danger rounded-card border p-4 text-sm">
        {t.loadError}
      </div>
    );
  }

  const requests = incomingRequestsQuery.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="border-soft bg-surface rounded-panel shadow-card border p-4 text-center sm:p-6">
        <p className="text-primary font-semibold">{t.emptyIncoming}</p>

        <p className="text-muted mt-1 text-sm">{t.emptyIncomingHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <IncomingFriendRequestItem key={request.id} request={request} />
      ))}
    </div>
  );
}
