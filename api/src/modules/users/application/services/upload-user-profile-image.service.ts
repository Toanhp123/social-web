import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_STORAGE,
  USER_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import type { FileStoragePort } from '@/modules/media/application/ports/file-storage.port.js';
import {
  UserProfileImage,
  UserProfileImageKind,
} from '@/modules/users/domain/entities/user-profile-image.entity.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';

export type ProfileImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

@Injectable()
export class UploadUserProfileImageService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: {
    userId: string;
    kind: UserProfileImageKind;
    file: ProfileImageFile | undefined;
  }): Promise<UserProfile> {
    const image = UserProfileImage.create(input.file, input.kind);

    const upload = await this.fileStorage.upload({
      buffer: image.buffer,
      folder: 'profiles',
      publicId: `${input.userId}/${image.kind}`,
      resourceType: 'image',
      overwrite: true,
    });

    return image.kind === 'avatar'
      ? await this.userRepository.updateAvatarUrl(
          input.userId,
          upload.secureUrl,
        )
      : await this.userRepository.updateCoverUrl(
          input.userId,
          upload.secureUrl,
        );
  }
}
