import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class GetGroupService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: { groupId: string; viewerId?: string }): Promise<Group> {
    const group = await this.groupRepository.findById(input);

    if (!group) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Group not found',
        404,
      );
    }

    return group;
  }
}
