import { Module } from '@nestjs/common';
import { GetUserService } from './application/services/get-user.service.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { UserController } from './presentation/controllers/user.controller.js';
import { USER_REPOSITORY } from '../../common/constants/provider-token.constant.js';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { SecurityModule } from '../../core/security/security.module.js';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [UserController],
  providers: [
    GetUserService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
