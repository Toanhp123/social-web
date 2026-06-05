import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import type { Job } from 'bullmq';
import { POST_FEED_CACHE } from '@/common/constants/provider-token.constant.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import {
  POST_FEED_JOB_NAMES,
  POST_FEED_QUEUE_NAME,
  type PostFeedJobData,
} from '@/modules/posts/infrastructure/queue/post-feed-queue.constants.js';

@Processor(POST_FEED_QUEUE_NAME)
export class PostFeedProcessor extends WorkerHost {
  constructor(
    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {
    super();
  }

  async process(job: Job<PostFeedJobData>): Promise<void> {
    if (job.name !== POST_FEED_JOB_NAMES.postCreated) {
      return;
    }

    await this.postFeedCache.invalidateAll();
  }
}
