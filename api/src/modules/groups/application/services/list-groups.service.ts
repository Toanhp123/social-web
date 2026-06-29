import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';
import { ListGroupsPage } from '@/modules/groups/domain/types/group.type.js';

@Injectable()
export class ListGroupsService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: {
    viewerId?: string;
    search?: string;
    limit?: number;
    cursor?: string;
  }): Promise<ListGroupsPage> {
    return this.groupRepository.listPage({
      viewerId: input.viewerId,
      search: input.search?.trim() || undefined,
      limit: input.limit ?? 20,
      cursor: input.cursor,
    });
  }
}
