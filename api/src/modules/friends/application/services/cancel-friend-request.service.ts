import { Inject, Injectable } from '@nestjs/common';
import { FRIEND_REQUEST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { FriendRequestActionInput } from '@/modules/friends/domain/types/friend.type.js';
import { FriendRequestRepository } from '../../domain/repositories/friend-request.repository.interface.js';

@Injectable()
export class CancelFriendRequestService {
  constructor(
    @Inject(FRIEND_REQUEST_REPOSITORY)
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  execute(input: FriendRequestActionInput): Promise<void> {
    return this.friendRequestRepository.cancelRequest(input);
  }
}
