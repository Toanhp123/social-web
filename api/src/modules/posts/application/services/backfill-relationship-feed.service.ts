import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_FEED_JOB_QUEUE,
  POST_FEED_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import type {
  BackfillRelationshipFeedInput,
  PostFeedRepository,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

const BACKFILL_PAGE_SIZE = 500;

@Injectable()
export class BackfillRelationshipFeedService {
  constructor(
    @Inject(POST_FEED_REPOSITORY)
    private readonly postFeedRepository: PostFeedRepository,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    private readonly realtimePublisher: RealtimePublisher,
  ) {}

  async execute(input: BackfillRelationshipFeedInput): Promise<void> {
    const page = await this.postFeedRepository.findRelationshipBackfillPostPage(
      {
        ...input,
        limit: BACKFILL_PAGE_SIZE,
      },
    );

    if (page.items.length > 0) {
      await this.postFeedRepository.createFeedItemsForRecipient({
        recipientId: input.recipientId,
        posts: page.items,
      });
    }

    if (page.nextCursor) {
      await this.postFeedJobQueue.enqueueRelationshipBackfillPage({
        recipientId: input.recipientId,
        sourceUserId: input.sourceUserId,
        reason: input.reason,
        cursor: page.nextCursor,
      });
      return;
    }

    await this.invalidateFeedCache();
    this.realtimePublisher.publishFeedUpdated();
  }

  private async invalidateFeedCache(): Promise<void> {
    try {
      await this.postFeedCache.invalidateAll();
    } catch {
      return;
    }
  }
}
