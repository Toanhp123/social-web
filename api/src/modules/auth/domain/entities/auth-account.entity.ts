import { UserRole } from '../../../../core/security/enums/user-role.enum.js';

export class AuthAccount {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly emailVerifiedAt: Date | null = null,
    public readonly passwordChangedAt: Date | null = null,
    public readonly disabledAt: Date | null = null,
  ) {}

  isDisabled(): boolean {
    return this.disabledAt !== null;
  }

  hasVerifiedEmail(): boolean {
    return this.emailVerifiedAt !== null;
  }
}
