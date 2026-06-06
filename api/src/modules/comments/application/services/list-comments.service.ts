import { Inject, Injectable } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CommentRepository } from '@/modules/comments/domain/repositories/comment.repository.interface.js';
import { ListCommentsCursor } from '@/modules/comments/domain/types/list-comments-query.type.js';

export type ListCommentsInput = {
  postId: string;
  viewerId?: string;
  parentId?: string;
  limit?: number;
  cursor?: string;
};

export type ListCommentsResult = {
  items: Comment[];
  nextCursor: string | null;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_LIMIT = 1;

@Injectable()
export class ListCommentsService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(input: ListCommentsInput): Promise<ListCommentsResult> {
    const limit = this.normalizeLimit(input.limit);
    const page = await this.commentRepository.findPage({
      postId: input.postId,
      viewerId: input.viewerId,
      parentId: input.parentId,
      limit,
      cursor: input.cursor ? this.decodeCursor(input.cursor) : undefined,
    });

    return {
      items: page.items,
      nextCursor: page.nextCursor ? this.encodeCursor(page.nextCursor) : null,
    };
  }

  private normalizeLimit(limit: number | undefined): number {
    if (limit === undefined || Number.isNaN(limit)) {
      return DEFAULT_LIMIT;
    }

    if (!Number.isInteger(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid comment page limit',
        400,
        { min: MIN_LIMIT, max: MAX_LIMIT },
      );
    }

    return limit;
  }

  private encodeCursor(cursor: ListCommentsCursor): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: cursor.createdAt.toISOString(),
        id: cursor.id,
      }),
      'utf8',
    ).toString('base64url');
  }

  private decodeCursor(cursor: string): ListCommentsCursor {
    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: unknown; id?: unknown };

      if (
        typeof decoded.createdAt !== 'string' ||
        typeof decoded.id !== 'string'
      ) {
        throw new Error('Invalid cursor payload');
      }

      const createdAt = new Date(decoded.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error('Invalid cursor date');
      }

      return { createdAt, id: decoded.id };
    } catch {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid comment page cursor',
      );
    }
  }
}
