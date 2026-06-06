import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { PostListQuery } from '@/modules/posts/domain/value-objects/post-list-query.value-object.js';

export type ListPostsInput = {
  viewerId?: string;
  limit?: number;
  cursor?: string;
};

export type ListPostsResult = {
  items: Post[];
  nextCursor: string | null;
};

@Injectable()
export class ListPostsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(input: ListPostsInput): Promise<ListPostsResult> {
    const query = PostListQuery.create(input);
    const cacheKey = {
      viewerId: query.viewerId ?? null,
      limit: query.limit,
      cursor: query.rawCursor,
    };
    const cached = await this.getCachedResult(cacheKey);

    if (cached) {
      return cached;
    }

    const page = await this.postRepository.findPage({
      viewerId: query.viewerId,
      limit: query.limit,
      cursor: query.cursor,
    });

    const result = {
      items: page.items,
      nextCursor: page.nextCursor
        ? PostListQuery.encodeCursor(page.nextCursor)
        : null,
    };

    await this.cacheResult(cacheKey, result);

    return result;
  }

  private async getCachedResult(input: {
    viewerId: string | null;
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
      viewerId: string | null;
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
}
