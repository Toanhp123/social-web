export type UserProfileInput = {
  bio?: string | null;
  website?: string | null;
  gender?: string | null;
  relationshipStatus?: string | null;
  birthday?: Date | null;
  isBirthdayPublic?: boolean;
  isFriendListPublic?: boolean;
  locationName?: string | null;
};
