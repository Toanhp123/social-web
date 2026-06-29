import { Module } from '@nestjs/common';
import {
  FRIEND_REQUEST_REPOSITORY,
  FRIENDSHIP_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaFriendRequestRepository } from '@/modules/friends/infrastructure/persistence/prisma-friend-request.repository.js';
import { PrismaFriendShipRepository } from '@/modules/friends/infrastructure/persistence/prisma-friend.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: FRIEND_REQUEST_REPOSITORY,
      useClass: PrismaFriendRequestRepository,
    },
    {
      provide: FRIENDSHIP_REPOSITORY,
      useClass: PrismaFriendShipRepository,
    },
  ],
  exports: [FRIEND_REQUEST_REPOSITORY, FRIENDSHIP_REPOSITORY],
})
export class FriendPersistenceModule {}
