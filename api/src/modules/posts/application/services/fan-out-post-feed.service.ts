import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_JOB_QUEUE,
  POST_FEED_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import type {
  FanOutPostInput,
  PostFeedRepository,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

const FAN_OUT_PAGE_SIZE = 1000;

@Injectable()
export class FanOutPostFeedService {
  constructor(
    @Inject(POST_FEED_REPOSITORY)
    private readonly postFeedRepository: PostFeedRepository,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    private readonly realtimePublisher: RealtimePublisher,
  ) {}

  async execute(input: FanOutPostInput): Promise<void> {
    const page = await this.postFeedRepository.findFanOutRecipientPage({
      ...input,
      limit: FAN_OUT_PAGE_SIZE,
    });

    if (page.items.length > 0) {
      await this.postFeedRepository.createFeedItems({
        postId: input.postId,
        recipients: page.items,
      });
    }

    if (page.nextCursor) {
      await this.postFeedJobQueue.enqueueFanOutPage({
        postId: input.postId,
        authorId: input.authorId,
        cursor: page.nextCursor,
      });
      return;
    }

    await this.postFeedCacheInvalidation.invalidateAll();
    this.realtimePublisher.publishFeedUpdated();
  }
}
