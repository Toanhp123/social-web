import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { ListPostsCursor } from '@/modules/posts/domain/types/list-posts-query.type.js';

export type ListPostsInput = {
  viewerId: string;
  limit?: number;
  cursor?: string;
};

export type ListPostsResult = {
  items: Post[];
  nextCursor: string | null;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const MIN_LIMIT = 1;

@Injectable()
export class ListPostsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(input: ListPostsInput): Promise<ListPostsResult> {
    const limit = this.normalizeLimit(input.limit);
    const cacheKey = {
      viewerId: input.viewerId,
      limit,
      cursor: input.cursor,
    };
    const cached = await this.getCachedResult(cacheKey);

    if (cached) {
      return cached;
    }

    const page = await this.postRepository.findPage({
      viewerId: input.viewerId,
      limit,
      cursor: input.cursor ? this.decodeCursor(input.cursor) : undefined,
    });

    const result = {
      items: page.items,
      nextCursor: page.nextCursor ? this.encodeCursor(page.nextCursor) : null,
    };

    await this.cacheResult(cacheKey, result);

    return result;
  }

  private async getCachedResult(input: {
    viewerId: string;
    limit: number;
    cursor?: string;
  }): Promise<ListPostsResult | null> {
    try {
      return await this.postFeedCache.get(input);
    } catch {
      return null;
    }
  }

  private async cacheResult(
    input: {
      viewerId: string;
      limit: number;
      cursor?: string;
    },
    result: ListPostsResult,
  ): Promise<void> {
    try {
      await this.postFeedCache.set(input, result);
    } catch {
      return;
    }
  }

  private normalizeLimit(limit: number | undefined): number {
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

  private encodeCursor(cursor: ListPostsCursor): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: cursor.createdAt.toISOString(),
        id: cursor.id,
      }),
      'utf8',
    ).toString('base64url');
  }

  private decodeCursor(cursor: string): ListPostsCursor {
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
        'Invalid post page cursor',
      );
    }
  }
}
