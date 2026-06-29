import type {
  PostFeedCacheKey,
  PostFeedCacheResult,
} from '@/modules/posts/application/ports/post-feed-cache.port.js';
import {
  POST_FEED_CACHE_INDEX_PREFIX,
  POST_FEED_CACHE_PREFIX,
} from '@/modules/posts/infrastructure/cache/post-feed-cache.constants.js';

export class RedisPostFeedCacheKeyBuilder {
  getCacheKey(key: PostFeedCacheKey): string {
    const encoded = Buffer.from(
      JSON.stringify({
        scope: key.scope,
        viewerId: key.viewerId,
        authorId: key.authorId ?? null,
        groupId: key.groupId ?? null,
        search: key.search ?? null,
        limit: key.limit,
        cursor: key.cursor ?? null,
      }),
      'utf8',
    ).toString('base64url');

    return `${POST_FEED_CACHE_PREFIX}:${encoded}`;
  }

  getIndexKeys(key: PostFeedCacheKey, result: PostFeedCacheResult): string[] {
    const keys = [this.getScopeIndexKey(key.scope)];

    if (key.viewerId) {
      keys.push(this.getViewerIndexKey(key.viewerId));
    }

    if (key.groupId) {
      keys.push(this.getGroupIndexKey(key.groupId));
    }

    if (key.authorId) {
      keys.push(this.getAuthorIndexKey(key.authorId));
    }

    for (const post of result.items) {
      keys.push(this.getPostIndexKey(post.id));
    }

    return keys;
  }

  getViewerIndexKey(viewerId: string): string {
    return `${POST_FEED_CACHE_INDEX_PREFIX}:viewer:${viewerId}`;
  }

  getGroupIndexKey(groupId: string): string {
    return `${POST_FEED_CACHE_INDEX_PREFIX}:group:${groupId}`;
  }

  getAuthorIndexKey(authorId: string): string {
    return `${POST_FEED_CACHE_INDEX_PREFIX}:author:${authorId}`;
  }

  getPostIndexKey(postId: string): string {
    return `${POST_FEED_CACHE_INDEX_PREFIX}:post:${postId}`;
  }

  decodeCacheKey(cacheKey: string): PostFeedCacheKey | null {
    const encoded = cacheKey.slice(`${POST_FEED_CACHE_PREFIX}:`.length);

    try {
      const parsed = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as PostFeedCacheKey;

      if (typeof parsed.scope !== 'string') {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private getScopeIndexKey(scope: PostFeedCacheKey['scope']): string {
    return `${POST_FEED_CACHE_INDEX_PREFIX}:scope:${scope}`;
  }
}
