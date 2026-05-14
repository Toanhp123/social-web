import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { User } from '@/modules/users/domain/entities/user.entity.js';

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
