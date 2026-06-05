import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { USER_PROFILE_FIELD_LIMITS } from '@/modules/users/domain/entities/user-profile.entity.js';

export class UserProfileInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(USER_PROFILE_FIELD_LIMITS.bio)
  bio?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(USER_PROFILE_FIELD_LIMITS.website)
  website?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(USER_PROFILE_FIELD_LIMITS.gender)
  gender?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(USER_PROFILE_FIELD_LIMITS.relationshipStatus)
  relationshipStatus?: string | null;

  @IsOptional()
  @IsDateString()
  birthday?: string | null;

  @IsOptional()
  @IsBoolean()
  isBirthdayPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFriendListPublic?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(USER_PROFILE_FIELD_LIMITS.locationName)
  locationName?: string | null;
}
