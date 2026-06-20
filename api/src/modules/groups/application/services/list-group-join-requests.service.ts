import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
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
    return this.groupRepository.listJoinRequests(input);
  }
}
