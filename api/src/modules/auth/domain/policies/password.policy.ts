import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';

export class PasswordPolicy {
  static assertStrong(password: string): void {
    if (!password.trim() || password.length < 6) {
      throw new DomainError(
        ErrorCode.WEAK_PASSWORD,
        'Password is too weak',
        400,
      );
    }
  }
}
