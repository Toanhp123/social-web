import { Inject, Injectable } from '@nestjs/common';
import { GroupJoinRequestStatus } from '@/generated/prisma/client.js';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import { GroupRolePolicy } from '@/modules/groups/domain/policies/group-role.policy.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class ReviewGroupJoinRequestService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async approve(input: {
    groupId: string;
    requestId: string;
    actorId: string;
  }): Promise<GroupJoinRequest> {
    await this.assertCanManageRequests(input.groupId, input.actorId);

    return this.groupRepository.updateJoinRequest({
      groupId: input.groupId,
      requestId: input.requestId,
      status: GroupJoinRequestStatus.APPROVED,
    });
  }

  async reject(input: {
    groupId: string;
    requestId: string;
    actorId: string;
  }): Promise<GroupJoinRequest> {
    await this.assertCanManageRequests(input.groupId, input.actorId);

    return this.groupRepository.updateJoinRequest({
      groupId: input.groupId,
      requestId: input.requestId,
      status: GroupJoinRequestStatus.REJECTED,
    });
  }

  private async assertCanManageRequests(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const membership = await this.groupRepository.findMembership({
      groupId,
      userId,
    });

    if (!GroupRolePolicy.canManageRequests(membership?.role)) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Only group admins can manage requests',
        403,
      );
    }
  }
}
