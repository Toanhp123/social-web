import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type {
  BackfillRelationshipFeedPageJobInput,
  FanOutPostFeedPageJobInput,
  PostFeedJobQueue,
  RemoveRelationshipFeedPageJobInput,
} from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import {
  POST_FEED_JOB_NAMES,
  POST_FEED_QUEUE_NAME,
  type PostFeedJobData,
} from '@/modules/posts/infrastructure/queue/post-feed-queue.constants.js';

@Injectable()
export class BullMqPostFeedJobQueue implements PostFeedJobQueue {
  constructor(
    @InjectQueue(POST_FEED_QUEUE_NAME)
    private readonly queue: Queue<PostFeedJobData>,
  ) {}

  async enqueueFanOutPage(input: FanOutPostFeedPageJobInput): Promise<void> {
    await this.queue.add(POST_FEED_JOB_NAMES.fanOutPage, input, {
      jobId: createJobId([
        POST_FEED_JOB_NAMES.fanOutPage,
        input.postId,
        input.cursor ?? 'initial',
      ]),
    });
  }

  async enqueueRelationshipBackfillPage(
    input: BackfillRelationshipFeedPageJobInput,
  ): Promise<void> {
    await this.queue.add(POST_FEED_JOB_NAMES.backfillRelationshipPage, input);
  }

  async enqueueRelationshipRemovalPage(
    input: RemoveRelationshipFeedPageJobInput,
  ): Promise<void> {
    await this.queue.add(POST_FEED_JOB_NAMES.removeRelationshipPage, input);
  }
}

function createJobId(parts: string[]): string {
  return parts.map((part) => encodeURIComponent(part)).join('|');
}
