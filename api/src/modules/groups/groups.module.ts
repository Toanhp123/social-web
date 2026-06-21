import { Module } from '@nestjs/common';
import { SecurityModule } from '@/core/security/security.module.js';
import { CreateGroupService } from '@/modules/groups/application/services/create-group.service.js';
import { GetGroupService } from '@/modules/groups/application/services/get-group.service.js';
import { GroupAccessService } from '@/modules/groups/application/services/group-access.service.js';
import { JoinGroupService } from '@/modules/groups/application/services/join-group.service.js';
import { ListGroupJoinRequestsService } from '@/modules/groups/application/services/list-group-join-requests.service.js';
import { ListGroupMembersService } from '@/modules/groups/application/services/list-group-members.service.js';
import { ListGroupsService } from '@/modules/groups/application/services/list-groups.service.js';
import { RemoveGroupMemberService } from '@/modules/groups/application/services/remove-group-member.service.js';
import { ReviewGroupJoinRequestService } from '@/modules/groups/application/services/review-group-join-request.service.js';
import { UpdateGroupMemberRoleService } from '@/modules/groups/application/services/update-group-member-role.service.js';
import { GroupPersistenceModule } from '@/modules/groups/infrastructure/persistence/group-persistence.module.js';
import { GroupController } from '@/modules/groups/presentation/controllers/group.controller.js';
import { PostFeedCacheModule } from '@/modules/posts/infrastructure/cache/post-feed-cache.module.js';

@Module({
  imports: [GroupPersistenceModule, SecurityModule, PostFeedCacheModule],
  controllers: [GroupController],
  providers: [
    CreateGroupService,
    GetGroupService,
    GroupAccessService,
    JoinGroupService,
    ListGroupJoinRequestsService,
    ListGroupMembersService,
    ListGroupsService,
    RemoveGroupMemberService,
    ReviewGroupJoinRequestService,
    UpdateGroupMemberRoleService,
  ],
  exports: [GroupAccessService],
})
export class GroupsModule {}
