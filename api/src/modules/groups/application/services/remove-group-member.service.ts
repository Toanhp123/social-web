import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { GroupRolePolicy } from '@/modules/groups/domain/policies/group-role.policy.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class RemoveGroupMemberService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: {
    groupId: string;
    actorId: string;
    userId: string;
  }): Promise<void> {
    const [actor, target] = await Promise.all([
      this.groupRepository.findMembership({
        groupId: input.groupId,
        userId: input.actorId,
      }),
      this.groupRepository.findMembership({
        groupId: input.groupId,
        userId: input.userId,
      }),
    ]);

    if (
      !GroupRolePolicy.canRemoveMember({
        actorUserId: input.actorId,
        actorRole: actor?.role,
        targetUserId: input.userId,
        targetRole: target?.role,
      })
    ) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Cannot remove this group member',
        403,
      );
    }

    await this.groupRepository.removeMember({
      groupId: input.groupId,
      userId: input.userId,
    });
  }
}
