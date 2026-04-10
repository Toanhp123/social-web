import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { UserRole } from '../../../../generated/prisma/enums.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';

export class User {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly username: string | null,
  ) {}

  static create(
    fullName: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
    username: string,
  ): User {
    if (!email || !email.includes('@')) {
      throw new DomainError(
        ErrorCode.INVALID_EMAIL,
        'Invalid email address',
        400,
        { email },
      );
    }

    if (!password.trim() || password.length < 8) {
      throw new DomainError(
        ErrorCode.WEAK_PASSWORD,
        'Password is too weak',
        400,
        { email },
      );
    }

    if (!fullName.trim() || fullName.length < 5) {
      throw new DomainError(
        ErrorCode.INVALID_FULLNAME,
        'FullName must be at least 5 characters',
        400,
        { email },
      );
    }

    if (username.trim() && username.length < 6) {
      throw new DomainError(
        ErrorCode.INVALID_USERNAME,
        'Username must be at least 6 characters',
        400,
        { email },
      );
    }

    return new User(
      '',
      fullName.trim(),
      email.toLowerCase().trim(),
      password,
      role,
      username.trim(),
    );
  }

  isValidEmail(): boolean {
    return this.email.includes('@');
  }
}
