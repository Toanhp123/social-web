export type UserProfile = {
  userId: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  coverUrl: string | null;
  website: string | null;
  gender: string | null;
  relationshipStatus: string | null;
  birthday: string | null;
  isBirthdayPublic: boolean;
  isFriendListPublic: boolean;
  locationName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
