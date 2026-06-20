import { Module } from '@nestjs/common';
import { SecurityModule } from '@/core/security/security.module.js';
import { PostsModule } from '@/modules/posts/posts.module.js';
import { FollowUserService } from '@/modules/follows/application/services/follow-user.service.js';
import { GetFollowStatusService } from '@/modules/follows/application/services/get-follow-status.service.js';
import { ListFollowersService } from '@/modules/follows/application/services/list-followers.service.js';
import { ListFollowingService } from '@/modules/follows/application/services/list-following.service.js';
import { UnfollowUserService } from '@/modules/follows/application/services/unfollow-user.service.js';
import { FollowPersistenceModule } from '@/modules/follows/infrastructure/persistence/follow-persistence.module.js';
import { FollowController } from '@/modules/follows/presentation/controllers/follow.controller.js';

@Module({
  imports: [FollowPersistenceModule, SecurityModule, PostsModule],
  controllers: [FollowController],
  providers: [
    FollowUserService,
    UnfollowUserService,
    GetFollowStatusService,
    ListFollowersService,
    ListFollowingService,
  ],
})
export class FollowsModule {}
