"use server";

import {
  sendFriendRequestAction as sendRequest,
  type SendFriendRequestActionResult,
} from "./server/send-friend-request.action";

import {
  acceptFriendRequestAction as acceptRequest,
  type AcceptFriendRequestActionResult,
} from "./server/accept-friend-request.action";

import {
  rejectFriendRequestAction as rejectRequest,
  type RejectFriendRequestActionResult,
} from "./server/reject-friend-request.action";

import {
  cancelFriendRequestAction as cancelRequest,
  type CancelFriendRequestActionResult,
} from "./server/cancel-friend-request.action";

import {
  listIncomingFriendRequestsAction as listIncoming,
  type ListIncomingFriendRequestsActionResult,
} from "./server/list-incoming-friend-requests.action";

import {
  listOutgoingFriendRequestsAction as listOutgoing,
  type ListOutgoingFriendRequestsActionResult,
} from "./server/list-outgoing-friend-requests.action";

export async function sendFriendRequestAction(
  receiverId: string,
): Promise<SendFriendRequestActionResult> {
  return sendRequest({ receiverId });
}

export async function acceptFriendRequestAction(
  requestId: string,
): Promise<AcceptFriendRequestActionResult> {
  return acceptRequest({ requestId });
}

export async function rejectFriendRequestAction(
  requestId: string,
): Promise<RejectFriendRequestActionResult> {
  return rejectRequest({ requestId });
}

export async function cancelFriendRequestAction(
  requestId: string,
): Promise<CancelFriendRequestActionResult> {
  return cancelRequest({ requestId });
}

export async function listIncomingFriendRequestsAction(): Promise<ListIncomingFriendRequestsActionResult> {
  return listIncoming();
}

export async function listOutgoingFriendRequestsAction(): Promise<ListOutgoingFriendRequestsActionResult> {
  return listOutgoing();
}
