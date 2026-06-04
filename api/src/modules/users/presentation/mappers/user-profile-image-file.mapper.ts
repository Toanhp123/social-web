import { ProfileImageFile } from '@/modules/users/application/services/upload-user-profile-image.service.js';

export type UploadedProfileImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export class UserProfileImageFileMapper {
  static toApplicationFile(
    file: UploadedProfileImageFile | undefined,
  ): ProfileImageFile | undefined {
    if (!file) {
      return undefined;
    }

    return {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
