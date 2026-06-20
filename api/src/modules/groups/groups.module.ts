import { Module } from '@nestjs/common';
import { SecurityModule } from '@/core/security/security.module.js';
import { CreateGroupService } from '@/modules/groups/application/services/create-group.service.js';
import { GetGroupService } from '@/modules/groups/application/services/get-group.service.js';
import { GroupAccessService } from '@/modules/groups/application/services/group-access.service.js';
import { JoinGroupService } from '@/modules/groups/application/services/join-group.service.js';
import { ListGroupJoinRequestsService } from '@/modules/groups/application/services/list-group-join-requests.service.js';
import { ListGroupsService } from '@/modules/groups/application/services/list-groups.service.js';
import { ReviewGroupJoinRequestService } from '@/modules/groups/application/services/review-group-join-request.service.js';
import { GroupPersistenceModule } from '@/modules/groups/infrastructure/persistence/group-persistence.module.js';
import { GroupController } from '@/modules/groups/presentation/controllers/group.controller.js';

@Module({
  imports: [GroupPersistenceModule, SecurityModule],
  controllers: [GroupController],
  providers: [
    CreateGroupService,
    GetGroupService,
    GroupAccessService,
    JoinGroupService,
    ListGroupJoinRequestsService,
    ListGroupsService,
    ReviewGroupJoinRequestService,
  ],
  exports: [GroupAccessService],
})
export class GroupsModule {}
