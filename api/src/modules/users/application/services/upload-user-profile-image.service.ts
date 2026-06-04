import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_STORAGE,
  USER_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { FileStoragePort } from '@/modules/media/application/ports/file-storage.port.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';

type ProfileImageKind = 'avatar' | 'cover';

export type ProfileImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
    kind: ProfileImageKind;
    file: ProfileImageFile | undefined;
  }): Promise<UserProfile> {
    this.assertValidImage(input.file, input.kind);

    const upload = await this.fileStorage.upload({
      buffer: input.file.buffer,
      folder: 'profiles',
      publicId: `${input.userId}/${input.kind}`,
      resourceType: 'image',
      overwrite: true,
    });

    return input.kind === 'avatar'
      ? await this.userRepository.updateAvatarUrl(
          input.userId,
          upload.secureUrl,
        )
      : await this.userRepository.updateCoverUrl(
          input.userId,
          upload.secureUrl,
        );
  }

  private assertValidImage(
    file: ProfileImageFile | undefined,
    kind: ProfileImageKind,
  ): asserts file is ProfileImageFile {
    if (!file) {
      throw new DomainError(ErrorCode.VALIDATION_ERROR, 'Image is required');
    }

    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Only JPEG, PNG, and WEBP images are allowed',
        400,
        { mimetype: file.mimetype },
      );
    }

    const maxBytes = kind === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxBytes) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Image file is too large',
        400,
        { maxBytes, size: file.size },
      );
    }
  }
}
