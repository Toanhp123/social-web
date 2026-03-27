import { Module } from '@nestjs/common';
import { GetUserService } from './application/services/get-user.service.js';
import { UserRepository } from './domain/repositories/user.repository.interface.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { UserController } from './presentation/controllers/user.controller.js';

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
