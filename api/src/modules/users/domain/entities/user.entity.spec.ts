import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { User } from '@/modules/users/domain/entities/user.entity.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';

describe('User', () => {
  it('creates a normalized user with a required id', () => {
    const user = User.create({
      id: 'user-1',
      fullName: 'Example User',
      email: ' USER@example.COM ',
      role: UserRole.USER,
      username: 'exampleuser',
    });

    expect(user).toEqual(
      expect.objectContaining({
        id: 'user-1',
        fullName: 'Example User',
        email: 'user@example.com',
        role: UserRole.USER,
        username: 'exampleuser',
      }),
    );
  });

  it('throws when id is empty', () => {
    expect(() =>
      User.create({
        id: ' ',
        fullName: 'Example User',
        email: 'user@example.com',
      }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.INVALID_USER_ID,
        statusCode: 400,
      }),
    );
  });
});

describe('UserProfile', () => {
  it('normalizes optional profile input strings', () => {
    const profile = UserProfile.normalizeInput({
      bio: '  hello  ',
      website: '   ',
      gender: null,
      locationName: undefined,
    });

    expect(profile).toMatchObject({
      bio: 'hello',
      website: null,
      gender: null,
      locationName: undefined,
    });
  });

  it('rejects invalid birthday dates', () => {
    expect(() =>
      UserProfile.normalizeInput({ birthday: new Date('invalid') }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });

  it('rejects profile fields that are too long', () => {
    expect(() =>
      UserProfile.normalizeInput({ gender: 'x'.repeat(51) }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });
});
