import { Inject, Injectable } from '@nestjs/common';
import {
  FOLLOW_REPOSITORY,
  POST_FEED_JOB_QUEUE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import { FollowStatus } from '@/modules/follows/domain/entities/follow-status.entity.js';
import { FollowRepository } from '@/modules/follows/domain/repositories/follow.repository.interface.js';
import { FollowUserInput } from '@/modules/follows/domain/types/follow.type.js';

@Injectable()
export class UnfollowUserService {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,
  ) {}

  async execute(input: FollowUserInput): Promise<FollowStatus> {
    const status = await this.unitOfWork.execute(() =>
      this.followRepository.unfollow(input),
    );

    await this.enqueueFeedRemoval(input);
    await this.postFeedCacheInvalidation.invalidateViewer(input.followerId);

    return status;
  }

  private async enqueueFeedRemoval(input: FollowUserInput): Promise<void> {
    try {
      await this.postFeedJobQueue.enqueueRelationshipRemovalPage({
        recipientId: input.followerId,
        sourceUserId: input.followingId,
        reason: 'FOLLOWING',
      });
    } catch {
      return;
    }
  }
}
