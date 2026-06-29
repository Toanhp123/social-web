import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';

export class JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  username: string | null;

  constructor(
    id: string,
    email: string,
    role: UserRole,
    fullName: string | null = null,
    username: string | null = null,
  ) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.fullName = fullName;
    this.username = username;
  }

  static fromAuthAccount(
    account: AuthAccount,
    profile?: { fullName?: string | null; username?: string | null },
  ): JwtPayload {
    return new JwtPayload(
      account.id,
      account.email,
      account.role,
      profile?.fullName ?? account.fullName,
      profile?.username ?? account.username,
    );
  }

  toPlainObject() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      fullName: this.fullName,
      username: this.username,
    };
  }
}
