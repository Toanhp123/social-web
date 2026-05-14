import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../../../../core/security/types/authenticated-user.type.js';
import { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.interface.js';
import { GetUserService } from './get-user.service.js';

describe('GetUserService', () => {
  const user = new User(
    'user-1',
    'Example User',
    'user@example.com',
    UserRole.USER,
    'exampleuser',
  );
  const currentUser: AuthenticatedUser = {
    userId: 'user-1',
    email: 'user@example.com',
    role: UserRole.USER,
  };
  let userRepository: jest.Mocked<UserRepository>;
  let service: GetUserService;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
    };
    service = new GetUserService(userRepository);
  });

  it('returns the private user profile for the current user', async () => {
    await expect(service.execute('user-1', currentUser)).resolves.toBe(user);
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });

  it('allows admins to read another private user profile', async () => {
    await expect(
      service.execute('user-1', {
        ...currentUser,
        userId: 'admin-1',
        role: UserRole.ADMIN,
      }),
    ).resolves.toBe(user);
  });

  it('rejects non-admin users reading another private profile', async () => {
    await expect(
      service.execute('user-1', {
        ...currentUser,
        userId: 'user-2',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.FORBIDDEN,
      statusCode: 403,
    });
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('throws when an allowed user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute('missing-user', {
        ...currentUser,
        userId: 'missing-user',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USER_NOT_FOUND,
      statusCode: 404,
    });
  });
});
