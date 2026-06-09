import { Inject, Injectable } from '@nestjs/common';
import {
  FRIENDSHIP_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { RemoveFriendInput } from '@/modules/friends/domain/types/friend.type.js';
import { PrismaFriendShipRepository } from '../../infrastructure/persistence/prisma-friend.repository.js';

@Injectable()
export class RemoveFriendService {
  constructor(
    @Inject(FRIENDSHIP_REPOSITORY)
    private readonly friendshipRepository: PrismaFriendShipRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(input: RemoveFriendInput): Promise<void> {
    return this.unitOfWork.execute(() =>
      this.friendshipRepository.removeFriend(input),
    );
  }
}
