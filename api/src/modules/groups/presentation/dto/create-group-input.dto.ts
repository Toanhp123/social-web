import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { GroupPrivacy } from '@/generated/prisma/client.js';

export class CreateGroupInputDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(Object.values(GroupPrivacy))
  privacy?: GroupPrivacy;
}
