import { FriendRequest } from '@/modules/friends/domain/entities/friend-request.entity.js';
import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';

export type SendFriendRequestInput = {
  requesterId: string;
  receiverId: string;
};

export type FriendRequestActionInput = {
  requestId: string;
  userId: string;
};

export type ListFriendRequestsInput = {
  userId: string;
  direction: 'incoming' | 'outgoing';
};

export type ListFriendsInput = {
  userId: string;
};

export type RemoveFriendInput = {
  userId: string;
  friendId: string;
};

export type AcceptFriendRequestResult = {
  request: FriendRequest;
  friendship: Friendship;
};
