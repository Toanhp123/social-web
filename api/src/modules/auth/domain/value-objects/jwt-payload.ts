import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';

export class JwtPayload {
  id: string;
  email: string;
  role: UserRole;

  constructor(id: string, email: string, role: UserRole) {
    this.id = id;
    this.email = email;
    this.role = role;
  }

  static fromAuthAccount(account: AuthAccount): JwtPayload {
    return new JwtPayload(account.id, account.email, account.role);
  }

  toPlainObject() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
    };
  }
}
