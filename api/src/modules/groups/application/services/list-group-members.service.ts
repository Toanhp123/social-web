import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { GroupAccessService } from '@/modules/groups/application/services/group-access.service.js';
import { GroupMember } from '@/modules/groups/domain/entities/group-member.entity.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

@Injectable()
export class ListGroupMembersService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,

    private readonly groupAccessService: GroupAccessService,
  ) {}

  async execute(input: {
    groupId: string;
    viewerId?: string;
  }): Promise<GroupMember[]> {
    await this.groupAccessService.assertCanView(input);

    return this.groupRepository.listMembers(input.groupId);
  }
}
