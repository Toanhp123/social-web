import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { UserSummary } from '@/modules/users/domain/entities/user-summary.entity.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { ListUserDiscoveryQuery } from '@/modules/users/domain/types/list-user-discovery-query.type.js';

@Injectable()
export class ListUserDiscoveryService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(query: ListUserDiscoveryQuery): Promise<UserSummary[]> {
    return this.userRepository.findDiscoveryCandidates(query);
  }
}
