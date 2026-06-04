import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';
import { UserProfileInputDto } from '@/modules/users/presentation/dto/user-profile-input.dto.js';

export class UserProfileInputMapper {
  static toApplication(dto: UserProfileInputDto): UserProfileInput {
    return {
      bio: this.normalizeNullableString(dto.bio),
      website: this.normalizeNullableString(dto.website),
      gender: this.normalizeNullableString(dto.gender),
      relationshipStatus: this.normalizeNullableString(dto.relationshipStatus),
      birthday: this.normalizeNullableDate(dto.birthday),
      isBirthdayPublic: dto.isBirthdayPublic,
      isFriendListPublic: dto.isFriendListPublic,
      locationName: this.normalizeNullableString(dto.locationName),
    };
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
    value: string | null | undefined,
  ): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value.trim() === '') {
      return null;
    }

    return new Date(value);
  }
}
