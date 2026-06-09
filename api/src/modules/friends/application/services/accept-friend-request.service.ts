import { Inject, Injectable } from '@nestjs/common';
import {
  FRIEND_REQUEST_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
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
  constructor(
    @Inject(FRIEND_REQUEST_REPOSITORY)
    private readonly friendRequestRepository: FriendRequestRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    private readonly createNotificationService: CreateNotificationService,
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

    return result;
  }
}
