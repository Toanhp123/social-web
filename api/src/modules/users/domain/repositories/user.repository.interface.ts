import { User } from '@/modules/users/domain/entities/user.entity.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserSummary } from '@/modules/users/domain/entities/user-summary.entity.js';
import { CreateUserInput } from '@/modules/users/domain/types/create-user-input.type.js';
import { ListUserDiscoveryQuery } from '@/modules/users/domain/types/list-user-discovery-query.type.js';
import { ListUserMentionQuery } from '@/modules/users/domain/types/list-user-mention-query.type.js';
import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';

export abstract class UserRepository {
  abstract create(input: CreateUserInput): Promise<void>;

  abstract findById(id: string): Promise<User | null>;

  abstract findDiscoveryCandidates(
    query: ListUserDiscoveryQuery,
  ): Promise<UserSummary[]>;

  abstract findMentionCandidates(
    query: ListUserMentionQuery,
  ): Promise<UserSummary[]>;

  abstract findSummariesByUsernames(
    usernames: string[],
  ): Promise<UserSummary[]>;

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
