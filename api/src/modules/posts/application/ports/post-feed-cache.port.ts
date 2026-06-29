import type { Post } from '@/modules/posts/domain/entities/post.entity.js';

export type PostFeedCacheKey = {
  scope: 'home' | 'group-feed' | 'group-detail' | 'author' | 'search';
  viewerId: string | null;
  authorId?: string | null;
  groupId?: string | null;
  search?: string | null;
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

  abstract invalidateGroup(groupId: string): Promise<void>;

  abstract invalidateViewer(viewerId: string): Promise<void>;

  abstract invalidateViewers(viewerIds: string[]): Promise<void>;

  abstract invalidateAuthor(authorId: string): Promise<void>;

  abstract invalidatePost(postId: string): Promise<void>;
}
