import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { EmailAddress } from '@/core/value-objects/email-address.js';

export type RegistrationProfileInput = {
  fullName: string;
  email: string;
  username?: string;
};

export type NormalizedRegistrationProfile = {
  fullName: string;
  email: string;
  username: string | null;
};

export class RegistrationProfilePolicy {
  static normalize(
    input: RegistrationProfileInput,
  ): NormalizedRegistrationProfile {
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

    return {
      fullName,
      email,
      username,
    };
  }
}
