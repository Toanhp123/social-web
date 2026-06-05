import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';

@Injectable()
export class CreateUserProfileService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, input: UserProfileInput): Promise<UserProfile> {
    const profile = UserProfile.normalizeInput(input);

    try {
      return await this.userRepository.createProfile(userId, profile);
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.code === ErrorCode.DUPLICATE_FIELD
      ) {
        throw new DomainError(
          ErrorCode.RESOURCE_CONFLICT,
          'User profile already exists',
          409,
          { userId },
        );
      }

      throw error;
    }
  }
}
