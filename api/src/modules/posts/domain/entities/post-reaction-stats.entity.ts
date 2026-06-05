export class PostReactionStats {
  constructor(
    public readonly likeCount: number,
    public readonly loveCount: number,
    public readonly hahaCount: number,
    public readonly wowCount: number,
    public readonly sadCount: number,
    public readonly angryCount: number,
    public readonly totalReactionCount: number,
  ) {}

  static empty(): PostReactionStats {
    return new PostReactionStats(0, 0, 0, 0, 0, 0, 0);
  }
}
