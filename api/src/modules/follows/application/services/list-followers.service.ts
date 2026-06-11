import { Inject, Injectable } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { Follow } from '@/modules/follows/domain/entities/follow.entity.js';
import { FollowRepository } from '@/modules/follows/domain/repositories/follow.repository.interface.js';
import { ListFollowsInput } from '@/modules/follows/domain/types/follow.type.js';

@Injectable()
export class ListFollowersService {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  execute(input: ListFollowsInput): Promise<Follow[]> {
    return this.followRepository.listFollowers(input);
  }
}
