import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';

export type ViewPrivateProfileAccessInput = {
  requesterId: string;
  requesterRole: UserRole;
  targetUserId: string;
};

export class UserProfileAccessPolicy {
  static assertCanViewPrivateProfile(
    input: ViewPrivateProfileAccessInput,
  ): void {
    if (
      input.requesterId === input.targetUserId ||
      input.requesterRole === UserRole.ADMIN
    ) {
      return;
    }

    throw new DomainError(
      ErrorCode.FORBIDDEN,
      'You are not allowed to view this user',
      403,
      { id: input.targetUserId },
    );
  }
}
