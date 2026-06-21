import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_JOB_QUEUE,
  POST_FEED_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import type {
  DeleteRelationshipFeedItemsInput,
  PostFeedRepository,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

const REMOVE_PAGE_SIZE = 500;

@Injectable()
export class RemoveRelationshipFeedService {
  constructor(
    @Inject(POST_FEED_REPOSITORY)
    private readonly postFeedRepository: PostFeedRepository,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    private readonly realtimePublisher: RealtimePublisher,
  ) {}

  async execute(input: DeleteRelationshipFeedItemsInput): Promise<void> {
    const page = await this.postFeedRepository.findRelationshipFeedItemPage({
      ...input,
      limit: REMOVE_PAGE_SIZE,
    });

    if (page.items.length > 0) {
      await this.postFeedRepository.deleteFeedItemsForRecipient({
        recipientId: input.recipientId,
        postIds: page.items.map((item) => item.postId),
      });
    }

    if (page.nextCursor) {
      await this.postFeedJobQueue.enqueueRelationshipRemovalPage({
        recipientId: input.recipientId,
        sourceUserId: input.sourceUserId,
        reason: input.reason,
        cursor: page.nextCursor,
      });
      return;
    }

    await this.postFeedCacheInvalidation.invalidateViewer(input.recipientId);
    this.realtimePublisher.publishFeedUpdated();
  }
}
