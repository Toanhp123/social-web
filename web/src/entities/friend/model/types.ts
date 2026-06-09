export type FriendUser = {
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
};

export type Friendship = {
  createdAt: string;
  user: FriendUser;
};

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type FriendRequest = {
  id: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
  requester: FriendUser;
  receiver: FriendUser;
};

export type AcceptFriendRequestResponse = {
  request: FriendRequest;
  friendship: Friendship;
};
