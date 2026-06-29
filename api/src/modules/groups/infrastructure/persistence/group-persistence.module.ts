import { Module } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaGroupRepository } from '@/modules/groups/infrastructure/persistence/prisma-group.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: GROUP_REPOSITORY,
      useClass: PrismaGroupRepository,
    },
  ],
  exports: [GROUP_REPOSITORY],
})
export class GroupPersistenceModule {}
