import { Expose } from 'class-transformer';
import { User } from '@/modules/users/domain/entities/user.entity.js';

export class UserResponseDto {
  @Expose() id!: string;
  @Expose() email!: string | null;
  @Expose() fullName!: string;
  @Expose() username!: string | null;

  static fromDomain(
    user: User,
    options: { includePrivateFields?: boolean } = {},
  ): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = options.includePrivateFields ? user.email : null;
    dto.fullName = user.fullName;
    dto.username = user.username;
    return dto;
  }
}
