import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { UserProfileAccessPolicy } from '@/modules/users/domain/policies/user-profile-access.policy.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';

@Injectable()
export class GetUserProfileService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    currentUser: AuthenticatedUser,
  ): Promise<UserProfile> {
    const profile = await this.userRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new DomainError(
        ErrorCode.USER_NOT_FOUND,
        `User with id ${userId} not found`,
        404,
        { id: userId },
      );
    }

    const canViewPrivateFields =
      UserProfileAccessPolicy.canViewPrivateProfileFields({
        requesterId: currentUser.userId,
        requesterRole: currentUser.role,
        targetUserId: userId,
      });

    return canViewPrivateFields ? profile : profile.hidePrivateFields();
  }
}
