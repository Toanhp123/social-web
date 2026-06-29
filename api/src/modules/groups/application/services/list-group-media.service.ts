import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { GroupAccessService } from '@/modules/groups/application/services/group-access.service.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

const DEFAULT_GROUP_MEDIA_LIMIT = 24;
const MAX_GROUP_MEDIA_LIMIT = 60;

@Injectable()
export class ListGroupMediaService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,

    private readonly groupAccessService: GroupAccessService,
  ) {}

  async execute(input: {
    groupId: string;
    viewerId?: string;
    limit?: number;
    cursor?: string;
  }) {
    await this.groupAccessService.assertCanView(input);

    return this.groupRepository.listMedia({
      groupId: input.groupId,
      limit: Math.min(
        input.limit ?? DEFAULT_GROUP_MEDIA_LIMIT,
        MAX_GROUP_MEDIA_LIMIT,
      ),
      cursor: input.cursor,
    });
  }
}
