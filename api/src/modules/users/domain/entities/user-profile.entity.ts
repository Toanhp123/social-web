export class UserProfile {
  constructor(
    public readonly userId: string,
    public readonly fullName: string,
    public readonly username: string | null,
    public readonly avatarUrl: string | null,
    public readonly bio: string | null,
    public readonly coverUrl: string | null,
    public readonly website: string | null,
    public readonly gender: string | null,
    public readonly relationshipStatus: string | null,
    public readonly birthday: Date | null,
    public readonly isBirthdayPublic: boolean,
    public readonly isFriendListPublic: boolean,
    public readonly locationName: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  hidePrivateFields(): UserProfile {
    return new UserProfile(
      this.userId,
      this.fullName,
      this.username,
      this.avatarUrl,
      this.bio,
      this.coverUrl,
      this.website,
      this.gender,
      this.relationshipStatus,
      this.isBirthdayPublic ? this.birthday : null,
      this.isBirthdayPublic,
      this.isFriendListPublic,
      this.locationName,
      this.createdAt,
      this.updatedAt,
    );
  }
}
