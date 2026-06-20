import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { ListPostsCursor } from '@/modules/posts/domain/types/list-posts-query.type.js';

type CreatePostListQueryInput = {
  viewerId?: string;
  authorId?: string;
  groupId?: string;
  search?: string;
  limit?: number;
  cursor?: string;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const MIN_LIMIT = 1;

export class PostListQuery {
  private constructor(
    public readonly viewerId: string | undefined,
    public readonly authorId: string | undefined,
    public readonly groupId: string | undefined,
    public readonly search: string | undefined,
    public readonly limit: number,
    public readonly cursor: ListPostsCursor | undefined,
    public readonly rawCursor: string | undefined,
  ) {}

  static create(input: CreatePostListQueryInput): PostListQuery {
    return new PostListQuery(
      input.viewerId,
      this.normalizeOptionalId(input.authorId),
      this.normalizeOptionalId(input.groupId),
      this.normalizeSearch(input.search),
      this.normalizeLimit(input.limit),
      input.cursor ? this.decodeCursor(input.cursor) : undefined,
      input.cursor,
    );
  }

  private static normalizeSearch(
    value: string | undefined,
  ): string | undefined {
    const normalizedValue = value?.trim();

    return normalizedValue || undefined;
  }

  private static normalizeOptionalId(
    value: string | undefined,
  ): string | undefined {
    const normalizedValue = value?.trim();

    return normalizedValue || undefined;
  }

  static encodeCursor(cursor: ListPostsCursor): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: cursor.createdAt.toISOString(),
        id: cursor.id,
        phase: cursor.phase,
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
        'Invalid post page limit',
        400,
        { min: MIN_LIMIT, max: MAX_LIMIT },
      );
    }

    return limit;
  }

  private static decodeCursor(cursor: string): ListPostsCursor {
    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: unknown; id?: unknown; phase?: unknown };

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

      return {
        createdAt,
        id: decoded.id,
        phase: decoded.phase === 'discover' ? 'discover' : 'feed',
      };
    } catch {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid post page cursor',
      );
    }
  }
}
