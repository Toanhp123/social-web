import { Injectable } from '@nestjs/common';
import { RedisService } from '@/infrastructure/redis/redis.service.js';
import type {
  PostFeedCacheKey,
  PostFeedCacheResult,
} from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import {
  POST_FEED_CACHE_PREFIX,
  POST_FEED_CACHE_SCAN_COUNT,
  POST_FEED_CACHE_TTL_SECONDS,
} from '@/modules/posts/infrastructure/cache/post-feed-cache.constants.js';
import {
  PostFeedCacheSerializer,
  type CachedPostFeed,
} from '@/modules/posts/infrastructure/cache/post-feed-cache.serializer.js';
import { RedisPostFeedCacheKeyBuilder } from '@/modules/posts/infrastructure/cache/redis-post-feed-cache-key.builder.js';

@Injectable()
export class RedisPostFeedCache implements PostFeedCache {
  private readonly keyBuilder = new RedisPostFeedCacheKeyBuilder();
  private readonly serializer = new PostFeedCacheSerializer();

  constructor(private readonly redisService: RedisService) {}

  async get(key: PostFeedCacheKey): Promise<PostFeedCacheResult | null> {
    const value = await this.redisService
      .getClient()
      .get(this.keyBuilder.getCacheKey(key));

    if (!value) {
      return null;
    }

    return this.serializer.toDomain(JSON.parse(value) as CachedPostFeed);
  }

  async set(key: PostFeedCacheKey, result: PostFeedCacheResult): Promise<void> {
    const redis = this.redisService.getClient();
    const cacheKey = this.keyBuilder.getCacheKey(key);
    const indexKeys = this.keyBuilder.getIndexKeys(key, result);
    const pipeline = redis.multi();

    pipeline.set(
      cacheKey,
      JSON.stringify(this.serializer.toCache(result)),
      'EX',
      POST_FEED_CACHE_TTL_SECONDS,
    );

    for (const indexKey of indexKeys) {
      pipeline.sadd(indexKey, cacheKey);
      pipeline.expire(indexKey, POST_FEED_CACHE_TTL_SECONDS);
    }

    await pipeline.exec();
  }

  async invalidateAll(): Promise<void> {
    await this.scanAndDelete(() => true, { deleteMalformed: true });
  }

  async invalidateGroup(groupId: string): Promise<void> {
    await this.deleteByIndexKeys([this.keyBuilder.getGroupIndexKey(groupId)]);
  }

  async invalidateViewer(viewerId: string): Promise<void> {
    await this.deleteByIndexKeys([this.keyBuilder.getViewerIndexKey(viewerId)]);
  }

  async invalidateViewers(viewerIds: string[]): Promise<void> {
    const indexKeys = Array.from(new Set(viewerIds))
      .filter(Boolean)
      .map((viewerId) => this.keyBuilder.getViewerIndexKey(viewerId));

    await this.deleteByIndexKeys(indexKeys);
  }

  async invalidateAuthor(authorId: string): Promise<void> {
    await this.deleteByIndexKeys([this.keyBuilder.getAuthorIndexKey(authorId)]);
  }

  async invalidatePost(postId: string): Promise<void> {
    await this.deleteByIndexKeys([this.keyBuilder.getPostIndexKey(postId)]);
  }

  private async scanAndDelete(
    shouldDelete: (key: PostFeedCacheKey) => boolean,
    options: { deleteMalformed?: boolean } = {},
  ): Promise<void> {
    const redis = this.redisService.getClient();
    let cursor = '0';

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${POST_FEED_CACHE_PREFIX}:*`,
        'COUNT',
        POST_FEED_CACHE_SCAN_COUNT,
      );

      cursor = nextCursor;

      const deletableKeys = keys.filter((key) => {
        const decodedKey = this.keyBuilder.decodeCacheKey(key);

        return decodedKey
          ? shouldDelete(decodedKey)
          : Boolean(options.deleteMalformed);
      });

      if (deletableKeys.length > 0) {
        await redis.del(...deletableKeys);
      }
    } while (cursor !== '0');
  }

  private async deleteByIndexKeys(indexKeys: string[]): Promise<void> {
    if (indexKeys.length === 0) {
      return;
    }

    const redis = this.redisService.getClient();
    const keyGroups = await Promise.all(
      indexKeys.map((indexKey) => redis.smembers(indexKey)),
    );
    const cacheKeys = Array.from(new Set(keyGroups.flat()));

    if (cacheKeys.length === 0) {
      await redis.del(...indexKeys);
      return;
    }

    await redis.del(...cacheKeys, ...indexKeys);
  }
}
