import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { FanOutPostFeedService } from '@/modules/posts/application/services/fan-out-post-feed.service.js';
import {
  POST_FEED_JOB_NAMES,
  POST_FEED_QUEUE_NAME,
  type PostFeedJobData,
} from '@/modules/posts/infrastructure/queue/post-feed-queue.constants.js';

@Processor(POST_FEED_QUEUE_NAME)
export class PostFeedProcessor extends WorkerHost {
  constructor(private readonly fanOutPostFeedService: FanOutPostFeedService) {
    super();
  }

  async process(job: Job<PostFeedJobData>): Promise<void> {
    if (job.name !== POST_FEED_JOB_NAMES.fanOutPage) {
      return;
    }

    await this.fanOutPostFeedService.execute(job.data);
  }
}
