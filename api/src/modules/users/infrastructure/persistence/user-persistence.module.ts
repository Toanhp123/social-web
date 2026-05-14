import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../../common/constants/provider-token.constant.js';
import { DatabaseModule } from '../../../../infrastructure/database/database.module.js';
import { PrismaUserRepository } from './prisma-user.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserPersistenceModule {}
