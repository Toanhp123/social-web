import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserProfileImage } from '@/modules/users/domain/entities/user-profile-image.entity.js';

describe('UserProfileImage', () => {
  it('creates a valid avatar image', () => {
    const image = UserProfileImage.create(
      { buffer: Buffer.from('avatar'), mimetype: 'image/webp', size: 1024 },
      'avatar',
    );

    expect(image.kind).toBe('avatar');
    expect(image.mimetype).toBe('image/webp');
  });

  it('rejects missing image files', () => {
    expect(() => UserProfileImage.create(undefined, 'avatar')).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });

  it('rejects unsupported image mime types', () => {
    expect(() =>
      UserProfileImage.create(
        { buffer: Buffer.from('image'), mimetype: 'image/gif', size: 1024 },
        'cover',
      ),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });

  it('rejects images that exceed kind-specific limits', () => {
    expect(() =>
      UserProfileImage.create(
        {
          buffer: Buffer.from('image'),
          mimetype: 'image/jpeg',
          size: UserProfileImage.getMaxBytes('avatar') + 1,
        },
        'avatar',
      ),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });
});
