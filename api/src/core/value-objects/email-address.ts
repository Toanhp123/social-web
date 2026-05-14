import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export class EmailAddress {
  private static readonly pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  static isValid(email: string): boolean {
    return this.pattern.test(this.normalize(email));
  }

  static normalizeAndValidate(email: string): string {
    const normalizedEmail = this.normalize(email);

    if (!this.pattern.test(normalizedEmail)) {
      throw new DomainError(
        ErrorCode.INVALID_EMAIL,
        'Invalid email address',
        400,
        { email: normalizedEmail },
      );
    }

    return normalizedEmail;
  }
}
