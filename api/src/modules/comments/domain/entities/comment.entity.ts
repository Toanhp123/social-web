import { CommentAuthor } from '@/modules/comments/domain/entities/comment-author.entity.js';

export class Comment {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly author: CommentAuthor,
    public readonly parentId: string | null,
    public readonly rootId: string,
    public readonly path: string,
    public readonly depth: number,
    public readonly content: string,
    public readonly replyCount: number,
    public readonly reactionCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
