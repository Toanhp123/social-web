import { Inject, Injectable } from '@nestjs/common';
import {
  FRIENDSHIP_REPOSITORY,
  POST_FEED_CACHE,
  POST_FEED_JOB_QUEUE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { RemoveFriendInput } from '@/modules/friends/domain/types/friend.type.js';
import { PrismaFriendShipRepository } from '../../infrastructure/persistence/prisma-friend.repository.js';

@Injectable()
export class RemoveFriendService {
  constructor(
    @Inject(FRIENDSHIP_REPOSITORY)
    private readonly friendshipRepository: PrismaFriendShipRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,
  ) {}

  async execute(input: RemoveFriendInput): Promise<void> {
    await this.unitOfWork.execute(() =>
      this.friendshipRepository.removeFriend(input),
    );
    await this.enqueueFriendFeedRemoval(input);
    await this.invalidateFeedCache();
  }

  private async enqueueFriendFeedRemoval(
    input: RemoveFriendInput,
  ): Promise<void> {
    try {
      await Promise.all([
        this.postFeedJobQueue.enqueueRelationshipRemovalPage({
          recipientId: input.userId,
          sourceUserId: input.friendId,
          reason: 'FRIEND_ACTIVITY',
        }),
        this.postFeedJobQueue.enqueueRelationshipRemovalPage({
          recipientId: input.friendId,
          sourceUserId: input.userId,
          reason: 'FRIEND_ACTIVITY',
        }),
      ]);
    } catch {
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
