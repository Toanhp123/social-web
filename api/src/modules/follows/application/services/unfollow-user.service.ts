import { Inject, Injectable } from '@nestjs/common';
import {
  FOLLOW_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
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
  ) {}

  execute(input: FollowUserInput): Promise<FollowStatus> {
    return this.unitOfWork.execute(() => this.followRepository.unfollow(input));
  }
}
