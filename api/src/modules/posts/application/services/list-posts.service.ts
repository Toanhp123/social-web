import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_FEED_REPOSITORY,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import {
  ListPostsCursor,
  ListPostsPage,
} from '@/modules/posts/domain/types/list-posts-query.type.js';
import { PostListQuery } from '@/modules/posts/domain/value-objects/post-list-query.value-object.js';

const DISCOVERY_START_CURSOR: ListPostsCursor = {
  createdAt: new Date('9999-12-31T23:59:59.999Z'),
  id: '~',
  phase: 'discover',
};

export type ListPostsInput = {
  viewerId?: string;
  authorId?: string;
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

    @Inject(POST_FEED_REPOSITORY)
    private readonly postFeedRepository: PostFeedRepository,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(input: ListPostsInput): Promise<ListPostsResult> {
    const query = PostListQuery.create(input);
    const cacheKey = {
      viewerId: query.viewerId ?? null,
      authorId: query.authorId ?? null,
      limit: query.limit,
      cursor: query.rawCursor,
    };
    const cached = await this.getCachedResult(cacheKey);

    if (cached) {
      return cached;
    }

    const page = await this.findPage({
      viewerId: query.viewerId,
      authorId: query.authorId,
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

  private async findPage(input: {
    viewerId?: string;
    authorId?: string;
    limit: number;
    cursor?: ListPostsCursor;
  }): Promise<ListPostsPage> {
    if (input.authorId || !input.viewerId) {
      return this.postRepository.findPage(input);
    }

    if (input.cursor?.phase === 'discover') {
      return this.findDiscoveryPage({
        viewerId: input.viewerId,
        limit: input.limit,
        cursor:
          input.cursor.id === DISCOVERY_START_CURSOR.id
            ? undefined
            : input.cursor,
      });
    }

    const feedPage = await this.postFeedRepository.findPage({
      viewerId: input.viewerId,
      limit: input.limit,
      cursor: input.cursor,
    });

    if (feedPage.items.length > 0) {
      return {
        ...feedPage,
        nextCursor: feedPage.nextCursor
          ? { ...feedPage.nextCursor, phase: 'feed' }
          : DISCOVERY_START_CURSOR,
      };
    }

    // Trending feed materialization is deferred; exhausted feeds only read global posts for now.
    return this.findDiscoveryPage({
      viewerId: input.viewerId,
      limit: input.limit,
    });
  }

  private async findDiscoveryPage(input: {
    viewerId: string;
    limit: number;
    cursor?: ListPostsCursor;
  }): Promise<ListPostsPage> {
    const page = await this.postRepository.findDiscoveryPage(input);

    return {
      ...page,
      nextCursor: page.nextCursor
        ? { ...page.nextCursor, phase: 'discover' }
        : null,
    };
  }

  private async getCachedResult(input: {
    viewerId: string | null;
    authorId: string | null;
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
      authorId: string | null;
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
