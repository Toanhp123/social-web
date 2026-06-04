import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { User } from '@/modules/users/domain/entities/user.entity.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserController } from '@/modules/users/presentation/controllers/user.controller.js';

describe('UserController', () => {
  const user = new User(
    'user-1',
    'Example User',
    'user@example.com',
    UserRole.USER,
    'exampleuser',
  );
  const profile = new UserProfile(
    'user-1',
    'Example User',
    'exampleuser',
    'https://cdn.example.com/avatar.jpg',
    'Hello',
    'https://cdn.example.com/cover.jpg',
    'https://example.com',
    'male',
    'single',
    new Date('2003-10-12T00:00:00.000Z'),
    true,
    true,
    'Ha Noi',
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-02T00:00:00.000Z'),
  );
  const currentUser: AuthenticatedUser = {
    userId: 'user-1',
    email: 'user@example.com',
    role: UserRole.USER,
  };

  const getUserService = { execute: jest.fn() };
  const getUserProfileService = { execute: jest.fn() };
  const createUserProfileService = { execute: jest.fn() };
  const updateUserProfileService = { execute: jest.fn() };
  const deleteUserProfileService = { execute: jest.fn() };
  const uploadUserProfileImageService = { execute: jest.fn() };

  let controller: UserController;

  beforeEach(() => {
    jest.clearAllMocks();

    getUserService.execute.mockResolvedValue(user as never);
    getUserProfileService.execute.mockResolvedValue(profile as never);
    createUserProfileService.execute.mockResolvedValue(profile as never);
    updateUserProfileService.execute.mockResolvedValue(profile as never);
    deleteUserProfileService.execute.mockResolvedValue(undefined as never);
    uploadUserProfileImageService.execute.mockResolvedValue(profile as never);

    controller = new UserController(
      getUserService as never,
      getUserProfileService as never,
      createUserProfileService as never,
      updateUserProfileService as never,
      deleteUserProfileService as never,
      uploadUserProfileImageService as never,
    );
  });

  it('delegates user access to the application service', async () => {
    await expect(controller.getUser('user-1', currentUser)).resolves.toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
      }),
    );

    expect(getUserService.execute).toHaveBeenCalledWith('user-1', currentUser);
  });

  it('delegates profile access to the application service', async () => {
    await expect(controller.getProfile('user-1', currentUser)).resolves.toEqual(
      expect.objectContaining({
        userId: 'user-1',
        avatarUrl: 'https://cdn.example.com/avatar.jpg',
      }),
    );

    expect(getUserProfileService.execute).toHaveBeenCalledWith(
      'user-1',
      currentUser,
    );
  });

  it('maps profile input before creating the current user profile', async () => {
    await controller.createMyProfile(
      {
        bio: '  Hello  ',
        birthday: '2003-10-12',
        locationName: '',
      },
      currentUser,
    );

    expect(createUserProfileService.execute).toHaveBeenCalledWith('user-1', {
      bio: 'Hello',
      website: undefined,
      gender: undefined,
      relationshipStatus: undefined,
      birthday: new Date('2003-10-12'),
      isBirthdayPublic: undefined,
      isFriendListPublic: undefined,
      locationName: null,
    });
  });

  it('maps uploaded avatar file before delegating upload', async () => {
    const file = {
      buffer: Buffer.from('avatar'),
      mimetype: 'image/png',
      size: 1024,
    };

    await controller.uploadMyAvatar(file, currentUser);

    expect(uploadUserProfileImageService.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      kind: 'avatar',
      file,
    });
  });
});
