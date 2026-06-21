import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import { GroupMember } from '@/modules/groups/domain/entities/group-member.entity.js';
import { GroupRolePolicy } from '@/modules/groups/domain/policies/group-role.policy.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';
import { ManageableGroupMemberRole } from '@/modules/groups/domain/types/group.type.js';

@Injectable()
export class UpdateGroupMemberRoleService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,
  ) {}

  async execute(input: {
    groupId: string;
    actorId: string;
    userId: string;
    role: ManageableGroupMemberRole;
  }): Promise<GroupMember> {
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
      !GroupRolePolicy.canChangeRole({
        actorUserId: input.actorId,
        actorRole: actor?.role,
        targetUserId: input.userId,
        targetRole: target?.role,
        nextRole: input.role,
      })
    ) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Cannot change this group member role',
        403,
      );
    }

    const member = await this.groupRepository.updateMemberRole({
      groupId: input.groupId,
      userId: input.userId,
      role: input.role,
    });

    await this.postFeedCacheInvalidation.invalidateViewer(input.userId);

    return member;
  }
}
