export class FollowStatus {
  constructor(
    public readonly isFollowing: boolean,
    public readonly followerCount: number,
    public readonly followingCount: number,
  ) {}
}
