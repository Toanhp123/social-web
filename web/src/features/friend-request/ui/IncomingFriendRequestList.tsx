"use client";

import { IncomingFriendRequestItem } from "./IncomingFriendRequestItem";
import { useIncomingFriendRequestsQuery } from "../model/use-incoming-friend-requests-query";

export function IncomingFriendRequestList() {
  const incomingRequestsQuery = useIncomingFriendRequestsQuery();

  if (incomingRequestsQuery.isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        Loading incoming friend requests...
      </p>
    );
  }

  if (incomingRequestsQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        Failed to load incoming friend requests.
      </p>
    );
  }

  const requests = incomingRequestsQuery.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">No incoming requests</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Friend requests you receive will appear here.
        </p>
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
