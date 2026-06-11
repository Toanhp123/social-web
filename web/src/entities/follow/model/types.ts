export type FollowUser = {
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
};

export type Follow = {
  createdAt: string;
  user: FollowUser;
};

export type FollowStatus = {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
};
