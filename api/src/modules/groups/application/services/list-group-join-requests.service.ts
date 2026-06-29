import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import { GroupRolePolicy } from '@/modules/groups/domain/policies/group-role.policy.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class ListGroupJoinRequestsService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: {
    groupId: string;
    userId: string;
  }): Promise<GroupJoinRequest[]> {
    const membership = await this.groupRepository.findMembership(input);

    if (!GroupRolePolicy.canManageRequests(membership?.role)) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Only group admins can manage requests',
        403,
      );
    }

    return this.groupRepository.listJoinRequests(input.groupId);
  }
}
