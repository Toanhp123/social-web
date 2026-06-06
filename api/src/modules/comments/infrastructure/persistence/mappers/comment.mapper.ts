import { Prisma } from '@/generated/prisma/client.js';
import { CommentAuthor } from '@/modules/comments/domain/entities/comment-author.entity.js';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CreateCommentInput } from '@/modules/comments/domain/types/create-comment-input.type.js';

export const COMMENT_INCLUDE = {
  user: {
    select: {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
    },
  },
  commentStats: true,
} as const;

export type CommentPayload = Prisma.CommentGetPayload<{
  include: typeof COMMENT_INCLUDE;
}>;

type CreateCommentPersistenceInput = CreateCommentInput & {
  id: string;
  rootId: string;
  path: string;
  depth: number;
};

export class CommentMapper {
  static include = COMMENT_INCLUDE;

  static toDomain(comment: CommentPayload): Comment {
    const stats = comment.commentStats.at(0);

    return new Comment(
      comment.id,
      comment.postId,
      new CommentAuthor(
        comment.user.id,
        comment.user.fullName,
        comment.user.username,
        comment.user.avatarUrl,
      ),
      comment.parentId,
      comment.rootId,
      comment.path,
      comment.depth,
      comment.content,
      stats?.replyCount ?? 0,
      stats?.reactionCount ?? 0,
      comment.createdAt,
      comment.updatedAt,
    );
  }

  static toPersistence(
    input: CreateCommentPersistenceInput,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      id: input.id,
      userId: input.userId,
      postId: input.postId,
      parentId: input.parentId,
      rootId: input.rootId,
      path: input.path,
      depth: input.depth,
      content: input.content,
      commentStats: {
        create: {},
      },
    };
  }
}
