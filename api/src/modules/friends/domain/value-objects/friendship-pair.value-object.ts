import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export class FriendshipPair {
  private constructor(
    public readonly user1Id: string,
    public readonly user2Id: string,
  ) {}

  static create(firstUserId: string, secondUserId: string): FriendshipPair {
    const left = firstUserId.trim();
    const right = secondUserId.trim();

    if (!left || !right) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Friendship users are required',
      );
    }

    if (left === right) {
      throw new DomainError(
        ErrorCode.OPERATION_NOT_ALLOWED,
        'Cannot create friendship with yourself',
      );
    }

    const [user1Id, user2Id] = [left, right].sort();

    return new FriendshipPair(user1Id, user2Id);
  }

  get key(): string {
    return `${this.user1Id}:${this.user2Id}`;
  }

  equals(other: FriendshipPair): boolean {
    return this.user1Id === other.user1Id && this.user2Id === other.user2Id;
  }

  toObject() {
    return {
      user1Id: this.user1Id,
      user2Id: this.user2Id,
    };
  }
}
