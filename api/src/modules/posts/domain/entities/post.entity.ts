import {
  PostType,
  PostVisibility,
  ReactionType,
} from '@/generated/prisma/client.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';
import { PostReactionStats } from '@/modules/posts/domain/entities/post-reaction-stats.entity.js';

export class Post {
  constructor(
    public readonly id: string,
    public readonly author: PostAuthor,
    public readonly content: string,
    public readonly type: PostType,
    public readonly visibility: PostVisibility,
    public readonly media: PostMedia[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly reactionStats: PostReactionStats = PostReactionStats.empty(),
    public readonly currentReaction: ReactionType | null = null,
  ) {}
}
