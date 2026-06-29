import { Inject, Injectable } from '@nestjs/common';
import { POST_FEED_CACHE } from '@/common/constants/provider-token.constant.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';

@Injectable()
export class PostFeedCacheInvalidationService {
  constructor(
    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async invalidateAll(): Promise<void> {
    await this.ignoreCacheErrors(() => this.postFeedCache.invalidateAll());
  }

  async invalidateGroup(groupId: string): Promise<void> {
    await this.ignoreCacheErrors(() =>
      this.postFeedCache.invalidateGroup(groupId),
    );
  }

  async invalidateViewer(viewerId: string): Promise<void> {
    await this.ignoreCacheErrors(() =>
      this.postFeedCache.invalidateViewer(viewerId),
    );
  }

  async invalidateViewers(viewerIds: string[]): Promise<void> {
    await this.ignoreCacheErrors(() =>
      this.postFeedCache.invalidateViewers(viewerIds),
    );
  }

  async invalidateAuthor(authorId: string): Promise<void> {
    await this.ignoreCacheErrors(() =>
      this.postFeedCache.invalidateAuthor(authorId),
    );
  }

  async invalidatePost(postId: string): Promise<void> {
    await this.ignoreCacheErrors(() =>
      this.postFeedCache.invalidatePost(postId),
    );
  }

  private async ignoreCacheErrors(action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch {
      return;
    }
  }
}
