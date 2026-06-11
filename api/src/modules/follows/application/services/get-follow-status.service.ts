import { Inject, Injectable } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { FollowStatus } from '@/modules/follows/domain/entities/follow-status.entity.js';
import { FollowRepository } from '@/modules/follows/domain/repositories/follow.repository.interface.js';
import { FollowUserInput } from '@/modules/follows/domain/types/follow.type.js';

@Injectable()
export class GetFollowStatusService {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  execute(input: FollowUserInput): Promise<FollowStatus> {
    return this.followRepository.getStatus(input);
  }
}
