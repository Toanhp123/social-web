import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export class FollowPair {
  private constructor(
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}

  static create(followerId: string, followingId: string): FollowPair {
    const normalizedFollowerId = followerId.trim();
    const normalizedFollowingId = followingId.trim();

    if (!normalizedFollowerId || !normalizedFollowingId) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Follow users are required',
        400,
      );
    }

    if (normalizedFollowerId === normalizedFollowingId) {
      throw new DomainError(
        ErrorCode.RESOURCE_CONFLICT,
        'Users cannot follow themselves',
        409,
      );
    }

    return new FollowPair(normalizedFollowerId, normalizedFollowingId);
  }
}
