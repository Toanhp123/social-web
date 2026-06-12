import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FRIEND_REQUEST_REPOSITORY,
  POST_FEED_CACHE,
  POST_FEED_JOB_QUEUE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { FriendRequest } from '@/modules/friends/domain/entities/friend-request.entity.js';
import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';
import { FriendRequestActionInput } from '@/modules/friends/domain/types/friend.type.js';
import { FriendRequestRepository } from '../../domain/repositories/friend-request.repository.interface.js';

export type AcceptFriendRequestServiceResult = {
  request: FriendRequest;
  friendship: Friendship;
};

@Injectable()
export class AcceptFriendRequestService {
  private readonly logger = new Logger(AcceptFriendRequestService.name);

  constructor(
    @Inject(FRIEND_REQUEST_REPOSITORY)
    private readonly friendRequestRepository: FriendRequestRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    private readonly createNotificationService: CreateNotificationService,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(
    input: FriendRequestActionInput,
  ): Promise<AcceptFriendRequestServiceResult> {
    const result = await this.unitOfWork.execute(() =>
      this.friendRequestRepository.acceptRequest(input),
    );

    await this.createNotificationService.execute({
      userId: result.request.requester.id,
      actorId: result.request.receiver.id,
      type: 'FRIEND_REQUEST_ACCEPTED',
      refId: result.request.id,
      aggregateKey: `friend-request-accepted:${result.request.id}`,
    });
    await this.enqueueFriendFeedBackfill(result.request);
    await this.invalidateFeedCache();

    return result;
  }

  private async enqueueFriendFeedBackfill(
    request: FriendRequest,
  ): Promise<void> {
    try {
      await Promise.all([
        this.postFeedJobQueue.enqueueRelationshipBackfillPage({
          recipientId: request.requester.id,
          sourceUserId: request.receiver.id,
          reason: 'FRIEND_ACTIVITY',
        }),
        this.postFeedJobQueue.enqueueRelationshipBackfillPage({
          recipientId: request.receiver.id,
          sourceUserId: request.requester.id,
          reason: 'FRIEND_ACTIVITY',
        }),
      ]);
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue friendship feed backfill for request ${request.id}`,
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
