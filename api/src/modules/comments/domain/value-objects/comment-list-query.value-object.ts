import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { ListCommentsCursor } from '@/modules/comments/domain/types/list-comments-query.type.js';

type CreateCommentListQueryInput = {
  postId: string;
  viewerId?: string;
  parentId?: string;
  limit?: number;
  cursor?: string;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_LIMIT = 1;

export class CommentListQuery {
  private constructor(
    public readonly postId: string,
    public readonly viewerId: string | undefined,
    public readonly parentId: string | undefined,
    public readonly limit: number,
    public readonly cursor: ListCommentsCursor | undefined,
  ) {}

  static create(input: CreateCommentListQueryInput): CommentListQuery {
    return new CommentListQuery(
      input.postId,
      input.viewerId,
      input.parentId,
      this.normalizeLimit(input.limit),
      input.cursor ? this.decodeCursor(input.cursor) : undefined,
    );
  }

  static encodeCursor(cursor: ListCommentsCursor): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: cursor.createdAt.toISOString(),
        id: cursor.id,
      }),
      'utf8',
    ).toString('base64url');
  }

  private static normalizeLimit(limit: number | undefined): number {
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

  private static decodeCursor(cursor: string): ListCommentsCursor {
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
