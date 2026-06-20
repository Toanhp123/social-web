import { Inject, Injectable } from '@nestjs/common';
import { GroupPrivacy } from '@/generated/prisma/client.js';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class GroupAccessService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async assertCanView(input: {
    groupId: string;
    viewerId?: string;
  }): Promise<void> {
    const group = await this.groupRepository.findById(input);

    if (!group) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Group not found',
        404,
      );
    }

    if (
      group.privacy === GroupPrivacy.PRIVATE &&
      group.ownerId !== input.viewerId &&
      !group.viewer.role
    ) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Group not found',
        404,
      );
    }
  }

  async assertCanPost(input: {
    groupId: string;
    userId: string;
  }): Promise<void> {
    const membership = await this.groupRepository.findMembership(input);

    if (!membership) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Only group members can post in this group',
        403,
      );
    }
  }
}
