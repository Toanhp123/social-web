import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { UserSummary } from '@/modules/users/domain/entities/user-summary.entity.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { ListUserMentionQuery } from '@/modules/users/domain/types/list-user-mention-query.type.js';

@Injectable()
export class ListUserMentionCandidatesService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(query: ListUserMentionQuery): Promise<UserSummary[]> {
    return this.userRepository.findMentionCandidates(query);
  }
}
