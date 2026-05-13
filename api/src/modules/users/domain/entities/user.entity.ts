import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';
import { EmailAddress } from '../../../../core/value-objects/email-address.js';

export class User {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly username: string | null,
  ) {}

  static create(input: {
    id: string;
    fullName: string;
    email: string;
    role?: UserRole;
    username?: string | null;
  }): User {
    const id = input.id.trim();
    const normalizedEmail = EmailAddress.normalizeAndValidate(input.email);
    const normalizedFullName = input.fullName.trim();
    const normalizedUsername = input.username?.trim() || null;

    if (!id) {
      throw new DomainError(
        ErrorCode.INVALID_USER_ID,
        'User id is required',
        400,
        { email: normalizedEmail },
      );
    }

    if (!normalizedFullName || normalizedFullName.length < 5) {
      throw new DomainError(
        ErrorCode.INVALID_FULLNAME,
        'FullName must be at least 5 characters',
        400,
        { email: normalizedEmail },
      );
    }

    if (normalizedUsername && normalizedUsername.length < 6) {
      throw new DomainError(
        ErrorCode.INVALID_USERNAME,
        'Username must be at least 6 characters',
        400,
        { email: normalizedEmail },
      );
    }

    return new User(
      id,
      normalizedFullName,
      normalizedEmail,
      input.role ?? UserRole.USER,
      normalizedUsername,
    );
  }

  static isValidEmail(email: string): boolean {
    return EmailAddress.isValid(email);
  }
}
