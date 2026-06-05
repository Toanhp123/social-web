import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type {
  PostCreatedFeedJobInput,
  PostFeedJobQueue,
} from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import {
  POST_FEED_JOB_NAMES,
  POST_FEED_QUEUE_NAME,
  type PostCreatedFeedJobData,
} from '@/modules/posts/infrastructure/queue/post-feed-queue.constants.js';

@Injectable()
export class BullMqPostFeedJobQueue implements PostFeedJobQueue {
  constructor(
    @InjectQueue(POST_FEED_QUEUE_NAME)
    private readonly queue: Queue<PostCreatedFeedJobData>,
  ) {}

  async enqueuePostCreated(input: PostCreatedFeedJobInput): Promise<void> {
    await this.queue.add(POST_FEED_JOB_NAMES.postCreated, input, {
      jobId: `${POST_FEED_JOB_NAMES.postCreated}:${input.postId}`,
    });
  }
}
