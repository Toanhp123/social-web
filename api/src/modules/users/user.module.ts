import { Module } from '@nestjs/common';
import { GetUserService } from '@/modules/users/application/services/get-user.service.js';
import { UserController } from '@/modules/users/presentation/controllers/user.controller.js';
import { SecurityModule } from '@/core/security/security.module.js';
import { UserPersistenceModule } from '@/modules/users/infrastructure/persistence/user-persistence.module.js';

@Module({
  imports: [UserPersistenceModule, SecurityModule],
  controllers: [UserController],
  providers: [GetUserService],
  exports: [UserPersistenceModule],
})
export class UserModule {}
