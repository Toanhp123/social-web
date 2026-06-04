import { Expose } from 'class-transformer';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';

export class UserProfileResponseDto {
  @Expose() userId!: string;
  @Expose() fullName!: string;
  @Expose() username!: string | null;
  @Expose() avatarUrl!: string | null;
  @Expose() bio!: string | null;
  @Expose() coverUrl!: string | null;
  @Expose() website!: string | null;
  @Expose() gender!: string | null;
  @Expose() relationshipStatus!: string | null;
  @Expose() birthday!: string | null;
  @Expose() isBirthdayPublic!: boolean;
  @Expose() isFriendListPublic!: boolean;
  @Expose() locationName!: string | null;
  @Expose() createdAt!: string | null;
  @Expose() updatedAt!: string | null;

  static fromDomain(profile: UserProfile): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();

    dto.userId = profile.userId;
    dto.fullName = profile.fullName;
    dto.username = profile.username;
    dto.avatarUrl = profile.avatarUrl;
    dto.bio = profile.bio;
    dto.coverUrl = profile.coverUrl;
    dto.website = profile.website;
    dto.gender = profile.gender;
    dto.relationshipStatus = profile.relationshipStatus;
    dto.birthday = profile.birthday?.toISOString() ?? null;
    dto.isBirthdayPublic = profile.isBirthdayPublic;
    dto.isFriendListPublic = profile.isFriendListPublic;
    dto.locationName = profile.locationName;
    dto.createdAt = profile.createdAt?.toISOString() ?? null;
    dto.updatedAt = profile.updatedAt?.toISOString() ?? null;

    return dto;
  }
}
