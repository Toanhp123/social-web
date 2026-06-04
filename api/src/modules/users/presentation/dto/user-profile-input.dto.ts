import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserProfileInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
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
  @MaxLength(255)
  locationName?: string | null;
}
