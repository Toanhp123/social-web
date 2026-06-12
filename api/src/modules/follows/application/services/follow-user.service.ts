import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FOLLOW_REPOSITORY,
  POST_FEED_CACHE,
  POST_FEED_JOB_QUEUE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { FollowStatus } from '@/modules/follows/domain/entities/follow-status.entity.js';
import { FollowRepository } from '@/modules/follows/domain/repositories/follow.repository.interface.js';
import { FollowUserInput } from '@/modules/follows/domain/types/follow.type.js';

@Injectable()
export class FollowUserService {
  private readonly logger = new Logger(FollowUserService.name);

  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(input: FollowUserInput): Promise<FollowStatus> {
    const currentStatus = await this.followRepository.getStatus(input);

    if (currentStatus.isFollowing) {
      return currentStatus;
    }

    const status = await this.unitOfWork.execute(() =>
      this.followRepository.follow(input),
    );

    await this.enqueueFeedBackfill(input);
    await this.invalidateFeedCache();

    return status;
  }

  private async enqueueFeedBackfill(input: FollowUserInput): Promise<void> {
    try {
      await this.postFeedJobQueue.enqueueRelationshipBackfillPage({
        recipientId: input.followerId,
        sourceUserId: input.followingId,
        reason: 'FOLLOWING',
      });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue feed backfill for follower ${input.followerId} and source user ${input.followingId}`,
        error instanceof Error ? error.stack : undefined,
      );
      return;
    }
  }

  private async invalidateFeedCache(): Promise<void> {
    try {
      await this.postFeedCache.invalidateAll();
    } catch {
      return;
    }
  }
}
