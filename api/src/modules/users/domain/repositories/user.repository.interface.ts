import { User } from '@/modules/users/domain/entities/user.entity.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';

export type CreateUserInput = {
  id: string;
  fullName: string;
  username: string | null;
};

export abstract class UserRepository {
  abstract create(input: CreateUserInput): Promise<void>;

  abstract findById(id: string): Promise<User | null>;

  abstract findProfileByUserId(userId: string): Promise<UserProfile | null>;

  abstract createProfile(
    userId: string,
    input: UserProfileInput,
  ): Promise<UserProfile>;

  abstract updateProfile(
    userId: string,
    input: UserProfileInput,
  ): Promise<UserProfile>;

  abstract deleteProfile(userId: string): Promise<void>;

  abstract updateAvatarUrl(
    userId: string,
    avatarUrl: string | null,
  ): Promise<UserProfile>;

  abstract updateCoverUrl(
    userId: string,
    coverUrl: string | null,
  ): Promise<UserProfile>;
}
