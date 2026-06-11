import { Module } from '@nestjs/common';
import { GetUserService } from '@/modules/users/application/services/get-user.service.js';
import { UserController } from '@/modules/users/presentation/controllers/user.controller.js';
import { SecurityModule } from '@/core/security/security.module.js';
import { UserPersistenceModule } from '@/modules/users/infrastructure/persistence/user-persistence.module.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { GetUserProfileService } from '@/modules/users/application/services/get-user-profile.service.js';
import { CreateUserProfileService } from '@/modules/users/application/services/create-user-profile.service.js';
import { UpdateUserProfileService } from '@/modules/users/application/services/update-user-profile.service.js';
import { DeleteUserProfileService } from '@/modules/users/application/services/delete-user-profile.service.js';
import { UploadUserProfileImageService } from '@/modules/users/application/services/upload-user-profile-image.service.js';
import { ListUserDiscoveryService } from '@/modules/users/application/services/list-user-discovery.service.js';

@Module({
  imports: [UserPersistenceModule, SecurityModule, MediaModule],
  controllers: [UserController],
  providers: [
    GetUserService,
    GetUserProfileService,
    CreateUserProfileService,
    UpdateUserProfileService,
    DeleteUserProfileService,
    UploadUserProfileImageService,
    ListUserDiscoveryService,
  ],
  exports: [UserPersistenceModule],
})
export class UserModule {}
