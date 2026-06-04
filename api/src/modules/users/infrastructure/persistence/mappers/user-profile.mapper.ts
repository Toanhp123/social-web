import { Prisma } from '@/generated/prisma/client.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';

export const USER_PROFILE_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
  profile: {
    select: {
      bio: true,
      coverUrl: true,
      website: true,
      gender: true,
      relationshipStatus: true,
      birthday: true,
      isBirthdayPublic: true,
      isFriendListPublic: true,
      locationName: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  },
} as const;

type UserProfilePayload = Prisma.UserGetPayload<{
  select: typeof USER_PROFILE_SELECT;
}>;

type ProfileData = {
  bio?: string | null;
  website?: string | null;
  gender?: string | null;
  relationshipStatus?: string | null;
  birthday?: Date | null;
  isBirthdayPublic?: boolean;
  isFriendListPublic?: boolean;
  locationName?: string | null;
};

export class UserProfileMapper {
  static select = USER_PROFILE_SELECT;

  static toDomain(prismaUser: UserProfilePayload): UserProfile {
    const profile = prismaUser.profile?.deletedAt ? null : prismaUser.profile;

    return new UserProfile(
      prismaUser.id,
      prismaUser.fullName,
      prismaUser.username,
      prismaUser.avatarUrl,
      profile?.bio ?? null,
      profile?.coverUrl ?? null,
      profile?.website ?? null,
      profile?.gender ?? null,
      profile?.relationshipStatus ?? null,
      profile?.birthday ?? null,
      profile?.isBirthdayPublic ?? false,
      profile?.isFriendListPublic ?? true,
      profile?.locationName ?? null,
      profile?.createdAt ?? null,
      profile?.updatedAt ?? null,
    );
  }

  static toPersistence(input: UserProfileInput): ProfileData {
    return {
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.website !== undefined ? { website: input.website } : {}),
      ...(input.gender !== undefined ? { gender: input.gender } : {}),
      ...(input.relationshipStatus !== undefined
        ? { relationshipStatus: input.relationshipStatus }
        : {}),
      ...(input.birthday !== undefined ? { birthday: input.birthday } : {}),
      ...(input.isBirthdayPublic !== undefined
        ? { isBirthdayPublic: input.isBirthdayPublic }
        : {}),
      ...(input.isFriendListPublic !== undefined
        ? { isFriendListPublic: input.isFriendListPublic }
        : {}),
      ...(input.locationName !== undefined
        ? { locationName: input.locationName }
        : {}),
    };
  }
}
