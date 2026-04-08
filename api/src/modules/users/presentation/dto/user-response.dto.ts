import { Expose } from 'class-transformer';
import { User } from '../../domain/entities/user.entity.js';

export class UserResponseDto {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() name!: string;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.username ?? '';
    return dto;
  }
}
