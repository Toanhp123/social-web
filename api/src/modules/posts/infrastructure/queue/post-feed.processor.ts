import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { BackfillRelationshipFeedService } from '@/modules/posts/application/services/backfill-relationship-feed.service.js';
import { FanOutPostFeedService } from '@/modules/posts/application/services/fan-out-post-feed.service.js';
import { RemovePostFeedService } from '@/modules/posts/application/services/remove-post-feed.service.js';
import { RemoveRelationshipFeedService } from '@/modules/posts/application/services/remove-relationship-feed.service.js';
import {
  POST_FEED_JOB_NAMES,
  POST_FEED_QUEUE_NAME,
  type BackfillRelationshipFeedPageJobData,
  type FanOutPostFeedPageJobData,
  type PostFeedJobData,
  type RemovePostFeedPageJobData,
  type RemoveRelationshipFeedPageJobData,
} from '@/modules/posts/infrastructure/queue/post-feed-queue.constants.js';

@Processor(POST_FEED_QUEUE_NAME)
export class PostFeedProcessor extends WorkerHost {
  constructor(
    private readonly fanOutPostFeedService: FanOutPostFeedService,
    private readonly backfillRelationshipFeedService: BackfillRelationshipFeedService,
    private readonly removeRelationshipFeedService: RemoveRelationshipFeedService,
    private readonly removePostFeedService: RemovePostFeedService,
  ) {
    super();
  }

  async process(job: Job<PostFeedJobData>): Promise<void> {
    if (job.name === POST_FEED_JOB_NAMES.fanOutPage) {
      await this.fanOutPostFeedService.execute(
        job.data as FanOutPostFeedPageJobData,
      );
      return;
    }

    if (job.name === POST_FEED_JOB_NAMES.backfillRelationshipPage) {
      await this.backfillRelationshipFeedService.execute(
        job.data as BackfillRelationshipFeedPageJobData,
      );
      return;
    }

    if (job.name === POST_FEED_JOB_NAMES.removeRelationshipPage) {
      await this.removeRelationshipFeedService.execute(
        job.data as RemoveRelationshipFeedPageJobData,
      );
      return;
    }

    if (job.name === POST_FEED_JOB_NAMES.removePostPage) {
      await this.removePostFeedService.execute(
        job.data as RemovePostFeedPageJobData,
      );
    }
  }
}
