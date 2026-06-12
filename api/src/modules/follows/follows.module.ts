import { Module } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { SecurityModule } from '@/core/security/security.module.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PostsModule } from '@/modules/posts/posts.module.js';
import { FollowUserService } from '@/modules/follows/application/services/follow-user.service.js';
import { GetFollowStatusService } from '@/modules/follows/application/services/get-follow-status.service.js';
import { ListFollowersService } from '@/modules/follows/application/services/list-followers.service.js';
import { ListFollowingService } from '@/modules/follows/application/services/list-following.service.js';
import { UnfollowUserService } from '@/modules/follows/application/services/unfollow-user.service.js';
import { PrismaFollowRepository } from '@/modules/follows/infrastructure/persistence/prisma-follow.repository.js';
import { FollowController } from '@/modules/follows/presentation/controllers/follow.controller.js';

@Module({
  imports: [DatabaseModule, SecurityModule, PostsModule],
  controllers: [FollowController],
  providers: [
    FollowUserService,
    UnfollowUserService,
    GetFollowStatusService,
    ListFollowersService,
    ListFollowingService,
    {
      provide: FOLLOW_REPOSITORY,
      useClass: PrismaFollowRepository,
    },
  ],
})
export class FollowsModule {}
