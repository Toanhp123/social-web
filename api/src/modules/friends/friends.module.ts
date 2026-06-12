import { Module } from '@nestjs/common';
import {
  FRIEND_REQUEST_REPOSITORY,
  FRIENDSHIP_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { SecurityModule } from '@/core/security/security.module.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { NotificationsModule } from '@/modules/notifications/notifications.module.js';
import { PostsModule } from '@/modules/posts/posts.module.js';
import { UserModule } from '@/modules/users/user.module.js';
import { CancelFriendRequestService } from '@/modules/friends/application/services/cancel-friend-request.service.js';
import { ListFriendRequestsService } from '@/modules/friends/application/services/list-friend-requests.service.js';
import { ListFriendsService } from '@/modules/friends/application/services/list-friends.service.js';
import { RemoveFriendService } from '@/modules/friends/application/services/remove-friend.service.js';
import { SendFriendRequestService } from '@/modules/friends/application/services/send-friend-request.service.js';
import { FriendController } from '@/modules/friends/presentation/controllers/friend.controller.js';
import { FriendRequestController } from './presentation/controllers/friendRequest.controller.js';
import { AcceptFriendRequestService } from '@/modules/friends/application/services/accept-friend-request.service.js';
import { RejectFriendRequestService } from '@/modules/friends/application/services/reject-friend-request.service.js';
import { PrismaFriendRequestRepository } from './infrastructure/persistence/prisma-friend-request.repository.js';
import { PrismaFriendShipRepository } from './infrastructure/persistence/prisma-friend.repository.js';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    UserModule,
    NotificationsModule,
    PostsModule,
  ],
  controllers: [FriendController, FriendRequestController],
  providers: [
    AcceptFriendRequestService,
    RejectFriendRequestService,
    SendFriendRequestService,
    CancelFriendRequestService,
    ListFriendRequestsService,
    ListFriendsService,
    RemoveFriendService,
    {
      provide: FRIEND_REQUEST_REPOSITORY,
      useClass: PrismaFriendRequestRepository,
    },
    {
      provide: FRIENDSHIP_REPOSITORY,
      useClass: PrismaFriendShipRepository,
    },
  ],
})
export class FriendsModule {}
