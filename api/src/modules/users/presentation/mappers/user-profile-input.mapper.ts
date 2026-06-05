import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';
import { UserProfileInputDto } from '@/modules/users/presentation/dto/user-profile-input.dto.js';

export class UserProfileInputMapper {
  static toApplication(dto: UserProfileInputDto): UserProfileInput {
    return {
      bio: dto.bio,
      website: dto.website,
      gender: dto.gender,
      relationshipStatus: dto.relationshipStatus,
      birthday: this.normalizeNullableDate(dto.birthday),
      isBirthdayPublic: dto.isBirthdayPublic,
      isFriendListPublic: dto.isFriendListPublic,
      locationName: dto.locationName,
    };
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
