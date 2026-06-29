import { IsEnum } from 'class-validator';
import { GroupPrivacy } from '@/generated/prisma/client.js';

export class UpdateGroupPrivacyInputDto {
  @IsEnum(GroupPrivacy)
  privacy!: GroupPrivacy;
}
