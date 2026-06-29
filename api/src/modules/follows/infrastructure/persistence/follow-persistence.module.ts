import { Module } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaFollowRepository } from '@/modules/follows/infrastructure/persistence/prisma-follow.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: FOLLOW_REPOSITORY,
      useClass: PrismaFollowRepository,
    },
  ],
  exports: [FOLLOW_REPOSITORY],
})
export class FollowPersistenceModule {}
