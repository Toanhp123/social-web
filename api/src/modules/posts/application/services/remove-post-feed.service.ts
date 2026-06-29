import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_JOB_QUEUE,
  POST_FEED_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import type {
  DeletePostFeedItemsInput,
  PostFeedRepository,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

const REMOVE_POST_FEED_PAGE_SIZE = 500;

@Injectable()
export class RemovePostFeedService {
  constructor(
    @Inject(POST_FEED_REPOSITORY)
    private readonly postFeedRepository: PostFeedRepository,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    private readonly realtimePublisher: RealtimePublisher,
  ) {}

  async execute(input: DeletePostFeedItemsInput): Promise<void> {
    const page = await this.postFeedRepository.findPostFeedItemPage({
      ...input,
      limit: REMOVE_POST_FEED_PAGE_SIZE,
    });

    if (page.items.length > 0) {
      await this.postFeedRepository.deleteFeedItemsForPost({
        postId: input.postId,
        userIds: page.items.map((item) => item.userId),
      });
    }

    if (page.nextCursor) {
      await this.postFeedJobQueue.enqueuePostFeedRemovalPage({
        postId: input.postId,
        cursor: page.nextCursor,
      });
      return;
    }

    await this.postFeedCacheInvalidation.invalidatePost(input.postId);
    this.realtimePublisher.publishFeedUpdated();
  }
}
