import { describe, expect, it, jest } from '@jest/globals';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../../../../core/security/types/authenticated-user.type.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserController } from './user.controller.js';

describe('UserController', () => {
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
  const getUserService = {
    execute: jest.fn().mockResolvedValue(user),
  };
  const controller = new UserController(getUserService as never);

  it('delegates private profile access to the application service', async () => {
    await expect(controller.getUser('user-1', currentUser)).resolves.toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
      }),
    );
    expect(getUserService.execute).toHaveBeenCalledWith('user-1', currentUser);
  });
});
