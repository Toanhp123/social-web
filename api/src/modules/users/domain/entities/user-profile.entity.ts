import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';

export const USER_PROFILE_FIELD_LIMITS = {
  bio: 500,
  website: 255,
  gender: 50,
  relationshipStatus: 100,
  locationName: 255,
} as const;

export class UserProfile {
  constructor(
    public readonly userId: string,
    public readonly fullName: string,
    public readonly username: string | null,
    public readonly avatarUrl: string | null,
    public readonly bio: string | null,
    public readonly coverUrl: string | null,
    public readonly website: string | null,
    public readonly gender: string | null,
    public readonly relationshipStatus: string | null,
    public readonly birthday: Date | null,
    public readonly isBirthdayPublic: boolean,
    public readonly isFriendListPublic: boolean,
    public readonly locationName: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  static normalizeInput(input: UserProfileInput): UserProfileInput {
    const profile: UserProfileInput = {
      bio: this.normalizeNullableString(input.bio),
      website: this.normalizeNullableString(input.website),
      gender: this.normalizeNullableString(input.gender),
      relationshipStatus: this.normalizeNullableString(
        input.relationshipStatus,
      ),
      birthday: this.normalizeNullableDate(input.birthday),
      isBirthdayPublic: input.isBirthdayPublic,
      isFriendListPublic: input.isFriendListPublic,
      locationName: this.normalizeNullableString(input.locationName),
    };

    this.assertMaxLength(profile.bio, 'bio', USER_PROFILE_FIELD_LIMITS.bio);
    this.assertMaxLength(
      profile.website,
      'website',
      USER_PROFILE_FIELD_LIMITS.website,
    );
    this.assertMaxLength(
      profile.gender,
      'gender',
      USER_PROFILE_FIELD_LIMITS.gender,
    );
    this.assertMaxLength(
      profile.relationshipStatus,
      'relationshipStatus',
      USER_PROFILE_FIELD_LIMITS.relationshipStatus,
    );
    this.assertMaxLength(
      profile.locationName,
      'locationName',
      USER_PROFILE_FIELD_LIMITS.locationName,
    );

    return profile;
  }

  hidePrivateFields(): UserProfile {
    return new UserProfile(
      this.userId,
      this.fullName,
      this.username,
      this.avatarUrl,
      this.bio,
      this.coverUrl,
      this.website,
      this.gender,
      this.relationshipStatus,
      this.isBirthdayPublic ? this.birthday : null,
      this.isBirthdayPublic,
      this.isFriendListPublic,
      this.locationName,
      this.createdAt,
      this.updatedAt,
    );
  }

  private static normalizeNullableString(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    return value.trim() || null;
  }

  private static normalizeNullableDate(
    value: Date | null | undefined,
  ): Date | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    if (Number.isNaN(value.getTime())) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid profile birthday',
      );
    }

    return value;
  }

  private static assertMaxLength(
    value: string | null | undefined,
    field: string,
    maxLength: number,
  ): void {
    if (value === undefined || value === null || value.length <= maxLength) {
      return;
    }

    throw new DomainError(
      ErrorCode.VALIDATION_ERROR,
      'User profile field is too long',
      400,
      { field, maxLength },
    );
  }
}
