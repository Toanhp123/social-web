import { Module } from '@nestjs/common';
import { GetUserService } from './application/services/get-user.service.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { UserController } from './presentation/controllers/user.controller.js';
import { USER_REPOSITORY } from '../../common/constants/repo.constant.js';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    GetUserService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
