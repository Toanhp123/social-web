import { Inject, Injectable } from '@nestjs/common';
import { GroupJoinRequestStatus } from '@/generated/prisma/client.js';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
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
    return this.groupRepository.updateJoinRequest({
      ...input,
      status: GroupJoinRequestStatus.APPROVED,
    });
  }

  async reject(input: {
    groupId: string;
    requestId: string;
    actorId: string;
  }): Promise<GroupJoinRequest> {
    return this.groupRepository.updateJoinRequest({
      ...input,
      status: GroupJoinRequestStatus.REJECTED,
    });
  }
}
