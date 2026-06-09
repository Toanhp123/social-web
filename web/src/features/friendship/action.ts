"use server";

import {
  listFriendsAction as listFriends,
  type ListFriendsActionResult,
} from "./server/list-friends.action";

import {
  removeFriendAction as removeFriend,
  type RemoveFriendActionResult,
} from "./server/remove-friend.action";

export async function listFriendsAction(): Promise<ListFriendsActionResult> {
  return listFriends();
}

export async function removeFriendAction(
  friendId: string,
): Promise<RemoveFriendActionResult> {
  return removeFriend({ friendId });
}
