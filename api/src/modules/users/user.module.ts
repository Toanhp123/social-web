import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller.js';
import { GetUserService } from './application/services/get-user.service.js';
import { UserRepository } from './domain/repositories/user.repository.interface.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    GetUserService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
