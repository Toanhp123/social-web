import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { FriendRequest } from '@/modules/friends/domain/entities/friend-request.entity.js';
import { SendFriendRequestInput } from '@/modules/friends/domain/types/friend.type.js';
import { FRIEND_REQUEST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { FriendRequestRepository } from '../../domain/repositories/friend-request.repository.interface.js';

@Injectable()
export class SendFriendRequestService {
  constructor(
    @Inject(FRIEND_REQUEST_REPOSITORY)
    private readonly friendRequestRepository: FriendRequestRepository,

    private readonly createNotificationService: CreateNotificationService,
  ) {}

  async execute(input: SendFriendRequestInput): Promise<FriendRequest> {
    const request = await this.friendRequestRepository.sendRequest(input);

    await this.createNotificationService.execute({
      userId: request.receiver.id,
      actorId: request.requester.id,
      type: 'FRIEND_REQUEST_RECEIVED',
      refId: request.id,
      aggregateKey: `friend-request:${request.id}`,
    });

    return request;
  }
}
