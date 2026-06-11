import type { Post } from '@/modules/posts/domain/entities/post.entity.js';

export type PostFeedCacheKey = {
  viewerId: string | null;
  authorId?: string | null;
  limit: number;
  cursor?: string;
};

export type PostFeedCacheResult = {
  items: Post[];
  nextCursor: string | null;
};

export abstract class PostFeedCache {
  abstract get(key: PostFeedCacheKey): Promise<PostFeedCacheResult | null>;

  abstract set(
    key: PostFeedCacheKey,
    result: PostFeedCacheResult,
  ): Promise<void>;

  abstract invalidateAll(): Promise<void>;
}
