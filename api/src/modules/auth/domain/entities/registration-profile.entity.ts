import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { EmailAddress } from '@/core/value-objects/email-address.js';

export type RegistrationProfileInput = {
  fullName: string;
  email: string;
  username?: string;
};

export class RegistrationProfile {
  private constructor(
    public readonly fullName: string,
    public readonly email: string,
    public readonly username: string | null,
  ) {}

  static create(input: RegistrationProfileInput): RegistrationProfile {
    const email = EmailAddress.normalizeAndValidate(input.email);
    const fullName = input.fullName.trim();
    const username = input.username?.trim() || null;

    if (!fullName || fullName.length < 5) {
      throw new DomainError(
        ErrorCode.INVALID_FULLNAME,
        'FullName must be at least 5 characters',
        400,
        { email },
      );
    }

    if (username && username.length < 6) {
      throw new DomainError(
        ErrorCode.INVALID_USERNAME,
        'Username must be at least 6 characters',
        400,
        { email },
      );
    }

    return new RegistrationProfile(fullName, email, username);
  }
}
