import { Expose } from 'class-transformer';
import { UserSummary } from '@/modules/users/domain/entities/user-summary.entity.js';

export class UserSummaryResponseDto {
  @Expose() id!: string;
  @Expose() fullName!: string;
  @Expose() username!: string | null;
  @Expose() avatarUrl!: string | null;

  static fromDomain(user: UserSummary): UserSummaryResponseDto {
    const dto = new UserSummaryResponseDto();

    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.username = user.username;
    dto.avatarUrl = user.avatarUrl;

    return dto;
  }
}
