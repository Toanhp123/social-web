"use client";

import { useFriendsQuery } from "@/features/friendship";
import { useIncomingFriendRequestsQuery } from "./use-incoming-friend-requests-query";
import { useOutgoingFriendRequestsQuery } from "./use-outgoing-friend-requests-query";

export function useProfileFriendshipStatus(userId: string) {
  const friendsQuery = useFriendsQuery();
  const incomingRequestsQuery = useIncomingFriendRequestsQuery();
  const outgoingRequestsQuery = useOutgoingFriendRequestsQuery();

  const friends = friendsQuery.data ?? [];
  const incomingRequests = incomingRequestsQuery.data ?? [];
  const outgoingRequests = outgoingRequestsQuery.data ?? [];

  return {
    isFriend: friends.some((friendship) => friendship.user.id === userId),
    incomingRequest: incomingRequests.find(
      (request) => request.requester.id === userId,
    ),
    outgoingRequest: outgoingRequests.find(
      (request) => request.receiver.id === userId,
    ),
    isLoading:
      friendsQuery.isLoading ||
      incomingRequestsQuery.isLoading ||
      outgoingRequestsQuery.isLoading,
    error:
      friendsQuery.error ??
      incomingRequestsQuery.error ??
      outgoingRequestsQuery.error,
  };
}
