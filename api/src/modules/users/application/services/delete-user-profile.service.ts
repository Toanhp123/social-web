import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';

@Injectable()
export class DeleteUserProfileService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    try {
      await this.userRepository.deleteProfile(userId);
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.code === ErrorCode.RECORD_NOT_FOUND
      ) {
        throw new DomainError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'User profile not found',
          404,
          { userId },
        );
      }

      throw error;
    }
  }
}
