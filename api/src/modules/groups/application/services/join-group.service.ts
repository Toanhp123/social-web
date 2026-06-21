import { Inject, Injectable } from '@nestjs/common';
import { GroupMemberRole, GroupPrivacy } from '@/generated/prisma/client.js';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';
import { JoinGroupResult } from '@/modules/groups/domain/types/group.type.js';

@Injectable()
export class JoinGroupService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,
  ) {}

  async execute(input: {
    groupId: string;
    userId: string;
  }): Promise<JoinGroupResult> {
    const group = await this.groupRepository.findById({
      groupId: input.groupId,
      viewerId: input.userId,
    });

    if (!group) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Group not found',
        404,
      );
    }

    const membership = await this.groupRepository.findMembership(input);

    if (membership) {
      return { status: 'member', group };
    }

    if (group.privacy === GroupPrivacy.PUBLIC) {
      await this.groupRepository.addMember({
        groupId: input.groupId,
        userId: input.userId,
        role: GroupMemberRole.MEMBER,
      });
      await this.postFeedCacheInvalidation.invalidateViewer(input.userId);

      const joinedGroup =
        (await this.groupRepository.findById({
          groupId: input.groupId,
          viewerId: input.userId,
        })) ?? group;

      return { status: 'member', group: joinedGroup };
    }

    const pendingRequest = await this.groupRepository.findPendingJoinRequest({
      groupId: input.groupId,
      requesterId: input.userId,
    });

    if (!pendingRequest) {
      await this.groupRepository.createJoinRequest({
        groupId: input.groupId,
        requesterId: input.userId,
      });
    }

    const pendingGroup =
      (await this.groupRepository.findById({
        groupId: input.groupId,
        viewerId: input.userId,
      })) ?? group;

    return { status: 'pending', group: pendingGroup };
  }
}
