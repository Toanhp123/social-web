"use client";

import { OutgoingFriendRequestItem } from "./OutgoingFriendRequestItem";
import { useOutgoingFriendRequestsQuery } from "../model/use-outgoing-friend-requests-query";

export function OutgoingFriendRequestList() {
  const outgoingRequestsQuery = useOutgoingFriendRequestsQuery();

  if (outgoingRequestsQuery.isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        Loading outgoing friend requests...
      </p>
    );
  }

  if (outgoingRequestsQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        Failed to load outgoing friend requests.
      </p>
    );
  }

  const requests = outgoingRequestsQuery.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">No outgoing requests</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Friend requests you send will appear here.
        </p>
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
