import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export type UserProfileImageKind = 'avatar' | 'cover';

export type UserProfileImageInput = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export const USER_PROFILE_IMAGE_LIMITS = {
  avatarMaxBytes: 5 * 1024 * 1024,
  coverMaxBytes: 10 * 1024 * 1024,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

const IMAGE_MIME_TYPES = new Set<string>(USER_PROFILE_IMAGE_LIMITS.mimeTypes);

export class UserProfileImage {
  private constructor(
    public readonly buffer: Buffer,
    public readonly mimetype: string,
    public readonly size: number,
    public readonly kind: UserProfileImageKind,
  ) {}

  static create(
    input: UserProfileImageInput | undefined,
    kind: UserProfileImageKind,
  ): UserProfileImage {
    if (!input) {
      throw new DomainError(ErrorCode.VALIDATION_ERROR, 'Image is required');
    }

    if (!IMAGE_MIME_TYPES.has(input.mimetype)) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Only JPEG, PNG, and WEBP images are allowed',
        400,
        { mimetype: input.mimetype },
      );
    }

    const maxBytes = this.getMaxBytes(kind);

    if (input.size > maxBytes) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Image file is too large',
        400,
        { maxBytes, size: input.size },
      );
    }

    return new UserProfileImage(input.buffer, input.mimetype, input.size, kind);
  }

  static getMaxBytes(kind: UserProfileImageKind): number {
    return kind === 'avatar'
      ? USER_PROFILE_IMAGE_LIMITS.avatarMaxBytes
      : USER_PROFILE_IMAGE_LIMITS.coverMaxBytes;
  }
}
