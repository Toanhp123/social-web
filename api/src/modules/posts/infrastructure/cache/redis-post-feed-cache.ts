import { Injectable } from '@nestjs/common';
import {
  MediaType,
  PostType,
  PostVisibility,
} from '@/generated/prisma/client.js';
import { RedisService } from '@/infrastructure/redis/redis.service.js';
import type {
  PostFeedCacheKey,
  PostFeedCacheResult,
} from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';

type CachedPostFeed = {
  items: CachedPost[];
  nextCursor: string | null;
};

type CachedPost = {
  id: string;
  author: {
    id: string;
    fullName: string;
    username: string | null;
    avatarUrl: string | null;
  };
  content: string;
  type: PostType;
  visibility: PostVisibility;
  media: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    mimeType: string | null;
    size: number | null;
    type: MediaType;
    width: number | null;
    height: number | null;
    duration: number | null;
    order: number;
    alt: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

const FEED_CACHE_PREFIX = 'posts:feed:v1';
const FEED_CACHE_TTL_SECONDS = 30;
const SCAN_COUNT = 100;

@Injectable()
export class RedisPostFeedCache implements PostFeedCache {
  constructor(private readonly redisService: RedisService) {}

  async get(key: PostFeedCacheKey): Promise<PostFeedCacheResult | null> {
    const value = await this.redisService.getClient().get(this.getKey(key));

    if (!value) {
      return null;
    }

    return this.toDomain(JSON.parse(value) as CachedPostFeed);
  }

  async set(key: PostFeedCacheKey, result: PostFeedCacheResult): Promise<void> {
    await this.redisService
      .getClient()
      .set(
        this.getKey(key),
        JSON.stringify(this.toCache(result)),
        'EX',
        FEED_CACHE_TTL_SECONDS,
      );
  }

  async invalidateAll(): Promise<void> {
    const redis = this.redisService.getClient();
    let cursor = '0';

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${FEED_CACHE_PREFIX}:*`,
        'COUNT',
        SCAN_COUNT,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  private getKey(key: PostFeedCacheKey): string {
    const encoded = Buffer.from(
      JSON.stringify({
        viewerId: key.viewerId,
        limit: key.limit,
        cursor: key.cursor ?? null,
      }),
      'utf8',
    ).toString('base64url');

    return `${FEED_CACHE_PREFIX}:${encoded}`;
  }

  private toCache(result: PostFeedCacheResult): CachedPostFeed {
    return {
      items: result.items.map((post) => ({
        id: post.id,
        author: {
          id: post.author.id,
          fullName: post.author.fullName,
          username: post.author.username,
          avatarUrl: post.author.avatarUrl,
        },
        content: post.content,
        type: post.type,
        visibility: post.visibility,
        media: post.media.map((media) => ({
          id: media.id,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          mimeType: media.mimeType,
          size: media.size,
          type: media.type,
          width: media.width,
          height: media.height,
          duration: media.duration,
          order: media.order,
          alt: media.alt,
        })),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
    };
  }

  private toDomain(result: CachedPostFeed): PostFeedCacheResult {
    return {
      items: result.items.map(
        (post) =>
          new Post(
            post.id,
            new PostAuthor(
              post.author.id,
              post.author.fullName,
              post.author.username,
              post.author.avatarUrl,
            ),
            post.content,
            post.type,
            post.visibility,
            post.media.map(
              (media) =>
                new PostMedia(
                  media.id,
                  media.url,
                  media.thumbnailUrl,
                  media.mimeType,
                  media.size,
                  media.type,
                  media.width,
                  media.height,
                  media.duration,
                  media.order,
                  media.alt,
                ),
            ),
            new Date(post.createdAt),
            new Date(post.updatedAt),
          ),
      ),
      nextCursor: result.nextCursor,
    };
  }
}
