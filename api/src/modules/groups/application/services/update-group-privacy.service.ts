import { Inject, Injectable } from '@nestjs/common';
import { GroupPrivacy } from '@/generated/prisma/client.js';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupRolePolicy } from '@/modules/groups/domain/policies/group-role.policy.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class UpdateGroupPrivacyService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,

    private readonly createNotificationService: CreateNotificationService,
  ) {}

  async execute(input: {
    groupId: string;
    actorId: string;
    privacy: GroupPrivacy;
  }): Promise<Group> {
    const membership = await this.groupRepository.findMembership({
      groupId: input.groupId,
      userId: input.actorId,
    });

    if (!GroupRolePolicy.canManageSettings(membership?.role)) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Only group admins can update group settings',
        403,
      );
    }

    const currentGroup = await this.groupRepository.findById({
      groupId: input.groupId,
      viewerId: input.actorId,
    });

    if (!currentGroup) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Group not found',
        404,
      );
    }

    if (currentGroup.privacy === input.privacy) {
      return currentGroup;
    }

    const updatedGroup = await this.groupRepository.updatePrivacy({
      groupId: input.groupId,
      viewerId: input.actorId,
      privacy: input.privacy,
    });

    await this.notifyMembersAboutPrivacyChange({
      group: updatedGroup,
      actorId: input.actorId,
    });

    return updatedGroup;
  }

  private async notifyMembersAboutPrivacyChange(input: {
    group: Group;
    actorId: string;
  }): Promise<void> {
    const members = await this.groupRepository.listMembers(input.group.id);
    const aggregateKey = `group-privacy:${input.group.id}:${input.group.privacy}:${Date.now()}`;

    await Promise.all(
      members
        .filter((member) => member.userId !== input.actorId)
        .map((member) =>
          this.createNotificationService.execute({
            userId: member.userId,
            actorId: input.actorId,
            type: 'GROUP_PRIVACY_CHANGED',
            refId: input.group.id,
            aggregateKey,
          }),
        ),
    );
  }
}
